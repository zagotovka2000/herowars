const TelegramBot = require('node-telegram-bot-api');
const UserService = require('./services/userService');
const HeroService = require('./services/heroService');
const BattleService = require('./services/battleService');

class GameBot extends TelegramBot {
  constructor(token, options, models) {
    super(token, options);
    this.models = models;
    this.userService = new UserService(models);
    this.heroService = new HeroService(models);
    this.battleService = new BattleService(models);
    
    this.initHandlers();
  }

  initHandlers() {
    this.onText(/\/start/, this.handleStart.bind(this));
    this.onText(/\/my_heroes/, this.handleMyHeroes.bind(this));
    this.onText(/\/create_team/, this.handleCreateTeam.bind(this));
    this.onText(/\/battle/, this.handleBattle.bind(this));
    this.onText(/\/upgrade_hero/, this.handleUpgradeHero.bind(this));
    
    // Web App данные
    this.on('web_app_data', this.handleWebAppData.bind(this));
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    try {
      let user = await this.userService.findOrCreate(telegramId, username);
      
      const welcomeMessage = `
🤖 Добро пожаловать в Hero Wars Bot!

Ваш аккаунт:
🏆 Уровень: ${user.level}
💰 Золото: ${user.gold}
💎 Самоцветы: ${user.gems}

Доступные команды:
/heroes - Ваши герои
/create_team - Создать команду
/battle - Найти противника
/upgrade_hero - Улучшить героя

Или откройте полный интерфейс через Web App!
      `;

      const keyboard = {
        inline_keyboard: [[
          {
            text: '🎮 Открыть игру',
            web_app: { url: `${process.env.WEB_APP_URL}/game` }
          }
        ]]
      };

      await this.sendMessage(chatId, welcomeMessage, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });

    } catch (error) {
      console.error('Start error:', error);
      await this.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
  }

  async handleBattle(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const activeTeam = await this.models.Team.findOne({
        where: { userId: user.id, isActive: true },
        include: [{ model: this.models.Hero }]
      });

      if (!activeTeam || activeTeam.Heroes.length !== 5) {
        await this.sendMessage(chatId, 
          '❌ У вас нет активной команды из 5 героев. Используйте /create_team'
        );
        return;
      }

      // Поиск противника
      const opponent = await this.userService.findRandomOpponent(user.id);
      const opponentTeam = await this.models.Team.findOne({
        where: { userId: opponent.id, isActive: true },
        include: [{ model: this.models.Hero }]
      });

      await this.sendMessage(chatId, '⚔️ Поиск противника...');

      const battleResult = await this.battleService.simulateBattle(activeTeam, opponentTeam);
      
      // Сохраняем результат битвы
      const battle = await this.models.Battle.create({
        player1Id: user.id,
        player2Id: opponent.id,
        winnerId: battleResult.winner === 'team1' ? user.id : 
                  battleResult.winner === 'team2' ? opponent.id : null,
        battleLog: battleResult.log,
        status: 'completed'
      });

      // Награды
      if (battleResult.winner === 'team1') {
        await user.update({
          gold: user.gold + 100,
          experience: user.experience + 50
        });
      }

      await this.sendMessage(chatId, 
        `📜 Лог битвы:\n\n${battleResult.log}\n\n` +
        `💰 Награда: ${battleResult.winner === 'team1' ? '100 золота + 50 опыта' : '0'}`
      );

    } catch (error) {
      console.error('Battle error:', error);
      await this.sendMessage(chatId, '❌ Ошибка в битве. Попробуйте позже.');
    }
  }

  async handleWebAppData(msg) {
    const data = JSON.parse(msg.web_app_data.data);
    const chatId = msg.chat.id;
    
    switch (data.action) {
      case 'upgrade_hero':
        await this.handleWebAppUpgrade(chatId, data);
        break;
      case 'create_team':
        await this.handleWebAppTeam(chatId, data);
        break;
    }
  }

  async handleWebAppUpgrade(chatId, data) {
    try {
      const result = await this.heroService.upgradeHero(data.heroId, data.userId);
      await this.sendMessage(chatId, 
        `✅ Герой улучшен!\nУровень: ${result.level}\nАтака: ${result.attack}`
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }
}

module.exports = GameBot;
