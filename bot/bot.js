require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

class GameBot extends TelegramBot {
  constructor(token, options, services) {
    super(token, options);
    this.models = services.models;
    this.userService = services.userService;
    this.heroService = services.heroService;
    this.battleService = services.battleService;
    this.webAppService = services.webAppService;
    
    // Автоматическая привязка всех методов
    this.bindAllMethods();
    this.initHandlers();
  }

  // Автоматическая привязка всех методов класса
  bindAllMethods() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(name => name !== 'constructor' && typeof this[name] === 'function');
    
    methodNames.forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  initHandlers() {
    // Текстовые команды
    this.onText(/\/start/, this.handleStart);
    this.onText(/\/my_heroes/, this.handleMyHeroes);
    this.onText(/\/create_team/, this.handleCreateTeam);
    this.onText(/\/battle/, this.handleBattle);
    this.onText(/\/upgrade_hero/, this.handleUpgradeHero);
    this.onText(/\/stats/, this.handleStats);
    this.onText(/\/buy_hero/, this.handleBuyHero);
    this.onText(/\/manage_team/, this.handleManageTeam);
    this.onText(/\/test/, this.handleTest);
    this.onText(/\/fix_gold/, this.handleFixGold);
    
    // Web App команды
    this.onText(/\/team/, this.handleWebAppTeam);
    this.onText(/\/webapp_battle/, this.handleWebAppBattle);

    // Callback queries и другие события
    this.on('callback_query', this.handleCallbackQuery);
    this.on('web_app_data', this.handleWebAppData);
  }

  setWebAppUrl(url) {
    this.webAppUrl = url;
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    try {
      let user = await this.userService.findOrCreate(telegramId, username);
      
      const welcomeMessage = `
🎮 Добро пожаловать в Hero Wars Bot!

✅ Режим: Web App включен
🎯 Бои теперь в визуальном режиме
👥 Управление командой через Web интерфейс

Ваш аккаунт:
🏆 Уровень: ${user.level}
💰 Золото: ${user.gold}
💎 Изумруды: ${user.gems}

Основные команды:
/start - это сообщение
/team - управление командой (Web App)
/battle - начать битву (Web App)
/my_heroes - список героев
/stats - статистика
/upgrade_hero - улучшить героя
/buy_hero - купить нового героя

⚡ Новое: Все битвы теперь происходят в Web App с визуальным отображением!
      `;

      await this.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '👥 Управление командой',
                web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}` }
              }
            ],
            [
              {
                text: '⚔️ Начать битву',
                web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/battle?telegramId=${telegramId}` }
              }
            ]
          ]
        }
      });

    } catch (error) {
      console.error('Start error:', error);
      await this.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    }
  }

  // Web App управление командой
  async handleWebAppTeam(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    
    try {
      // Проверяем наличие домена
      if (!process.env.WEBHOOK_DOMAIN) {
        await this.sendMessage(chatId, 
          '❌ Web App временно недоступен.\n' +
          'Пожалуйста, используйте текстовые команды для управления командой.'
        );
        return;
      }

      const webAppUrl = `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}`;
      
      await this.sendMessage(chatId, '👥 Управление командой в Web App', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎯 Открыть управление командой',
              web_app: { url: webAppUrl }
            }
          ]]
        }
      });
    } catch (error) {
      console.error('WebApp team error:', error);
      await this.sendMessage(chatId, '❌ Ошибка открытия Web App. Используйте /manage_team для текстового управления.');
    }
  }

  // Web App битва
  async handleWebAppBattle(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    
    try {
      // Проверяем наличие домена
      if (!process.env.WEBHOOK_DOMAIN) {
        await this.sendMessage(chatId, 
          '❌ Web App временно недоступен.\n' +
          'Пожалуйста, используйте /battle для текстовой битвы.'
        );
        return;
      }

      const user = await this.userService.findByTelegramId(telegramId);
      const activeTeam = await this.models.Team.findOne({
        where: { userId: user.id, isActive: true },
        include: [{ model: this.models.Hero }]
      });

      if (!activeTeam || activeTeam.Heroes.length !== 5) {
        await this.sendMessage(chatId, 
          '❌ Для начала боя нужна полная команда из 5 героев!\n\n' +
          'Соберите команду через Web App:\n' +
          '👥 /team - управление командой\n' +
          '🛒 /buy_hero - купить героев\n' +
          '🎯 /my_heroes - посмотреть героев'
        );
        return;
      }

      const webAppUrl = `${process.env.WEBHOOK_DOMAIN}/webapp/battle?telegramId=${telegramId}`;
      
      await this.sendMessage(chatId, '⚔️ Готовы к битве?', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '⚔️ В БОЙ!',
              web_app: { url: webAppUrl }
            }
          ]]
        }
      });
    } catch (error) {
      console.error('WebApp battle error:', error);
      await this.sendMessage(chatId, '❌ Ошибка начала боя. Используйте /battle для текстовой версии.');
    }
  }

  async handleTest(msg) {
    const chatId = msg.chat.id;
    
    try {
      await this.sendMessage(chatId, 
        `✅ Тестовая команда работает!\n` +
        `🕒 Время: ${new Date().toLocaleString()}\n` +
        `🔧 Режим: ${process.env.WEBHOOK_DOMAIN ? 'Web App включен' : 'Web App отключен'}\n` +
        `🌐 Web App: ${process.env.WEBHOOK_DOMAIN || 'не настроен'}\n` +
        `💡 Все изменения кода применяются мгновенно!`
      );
    } catch (error) {
      console.error('Test command error:', error);
      await this.sendMessage(chatId, '❌ Ошибка тестовой команды');
    }
  }

  async handleMyHeroes(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      if (heroes.length === 0) {
        await this.sendMessage(chatId, 
          '❌ У вас пока нет героев.\n' +
          'Используйте /buy_hero чтобы купить первого героя!'
        );
        return;
      }

      let message = '🎯 Ваши герои:\n\n';
      heroes.forEach((hero, index) => {
        message += `${index + 1}. ${hero.name} (${hero.heroClass})\n`;
        message += `   Ур. ${hero.level} | ❤️ ${hero.health} | ⚔️ ${hero.attack} | 🛡️ ${hero.defense}\n`;
        message += `   🏃 ${hero.speed} | 🎯 ${(hero.criticalChance * 100).toFixed(1)}% | 💥 ${hero.criticalDamage.toFixed(1)}x\n\n`;
      });

      message += `\n💡 Всего героев: ${heroes.length}\n`;
      message += `💡 Используйте /team для управления командой через Web App`;

      const keyboard = process.env.WEBHOOK_DOMAIN ? {
        inline_keyboard: [[
          {
            text: '👥 Управление командой в Web App',
            web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}` }
          }
        ]]
      } : undefined;

      await this.sendMessage(chatId, message, {
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('MyHeroes error:', error);
      await this.sendMessage(chatId, '❌ Ошибка при получении списка героев.');
    }
  }

  async handleCreateTeam(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      if (heroes.length < 5) {
        await this.sendMessage(chatId, 
          `❌ У вас недостаточно героев для создания команды.\n\n` +
          `Нужно: 5 героев\n` +
          `У вас: ${heroes.length} героев\n\n` +
          `Не хватает: ${5 - heroes.length} героев\n\n` +
          `Используйте команды:\n` +
          `🛒 /buy_hero - купить нового героя (500 золота)\n` +
          `🎯 /my_heroes - посмотреть ваших героев\n` +
          `👥 /team - управление командой через Web App`
        );
        return;
      }

      const team = await this.models.Team.create({
        name: `Команда ${user.username}`,
        isActive: true,
        userId: user.id
      });

      await this.models.Team.update(
        { isActive: false },
        { 
          where: { 
            userId: user.id,
            id: { [this.models.Sequelize.Op.ne]: team.id }
          }
        }
      );

      for (let i = 0; i < 5; i++) {
        await this.heroService.addHeroToTeam(heroes[i].id, team.id, i + 1);
      }

      const keyboard = process.env.WEBHOOK_DOMAIN ? {
        inline_keyboard: [[
          {
            text: '🎯 Настроить команду в Web App',
            web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}` }
          }
        ]]
      } : undefined;

      await this.sendMessage(chatId, 
        `✅ Команда создана!\n\n` +
        `В команду добавлены:\n` +
        `${heroes.slice(0, 5).map((h, i) => `${i + 1}. ${h.name} (${h.heroClass})`).join('\n')}\n\n` +
        `Используйте /team для настройки состава команды через Web App`,
        {
          reply_markup: keyboard
        }
      );

    } catch (error) {
      console.error('CreateTeam error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleBattle(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      // Проверяем наличие Web App домена
      if (process.env.WEBHOOK_DOMAIN) {
        // Используем Web App версию
        const user = await this.userService.findByTelegramId(telegramId);
        const activeTeam = await this.models.Team.findOne({
          where: { userId: user.id, isActive: true },
          include: [{ model: this.models.Hero }]
        });

        if (!activeTeam || activeTeam.Heroes.length !== 5) {
          await this.sendMessage(chatId, 
            '❌ Для начала боя нужна полная команда из 5 героев!\n\n' +
            'Соберите команду через Web App:\n' +
            '👥 /team - управление командой\n' +
            '🛒 /buy_hero - купить героев'
          );
          return;
        }

        const webAppUrl = `${process.env.WEBHOOK_DOMAIN}/webapp/battle?telegramId=${telegramId}`;
        
        await this.sendMessage(chatId, 
          `⚔️ Битва теперь происходит в Web App!\n\n` +
          `Ваша команда готова:\n` +
          `${activeTeam.Heroes.map((h, i) => `${i + 1}. ${h.name} (${h.heroClass})`).join('\n')}\n\n` +
          `Нажмите кнопку ниже чтобы начать битву с визуальным отображением!`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '⚔️ Начать битву в Web App',
                  web_app: { url: webAppUrl }
                }
              ]]
            }
          }
        );
      } else {
        // Старая текстовая версия битвы (для обратной совместимости)
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

        await this.sendMessage(chatId, '⚔️ Поиск противника...');

        const opponent = await this.userService.findRandomOpponent(user.id);
        const opponentTeam = await this.models.Team.findOne({
          where: { userId: opponent.id, isActive: true },
          include: [{ model: this.models.Hero }]
        });

        if (!opponentTeam || opponentTeam.Heroes.length !== 5) {
          await this.sendMessage(chatId, '❌ Не удалось найти подходящего противника.');
          return;
        }

        const battleResult = await this.battleService.simulateBattle(activeTeam, opponentTeam);
        
        const battle = await this.models.Battle.create({
          player1Id: user.id,
          player2Id: opponent.id,
          winnerId: battleResult.winner === 'team1' ? user.id : 
                    battleResult.winner === 'team2' ? opponent.id : null,
          battleLog: battleResult.log,
          status: 'completed'
        });

        let rewardMessage = '';
        if (battleResult.winner === 'team1') {
          await this.userService.updateUserResources(user.id, {
            gold: 100,
            experience: 50
          });
          rewardMessage = '\n💰 Награда: 100 золота + 50 опыта';
        } else if (battleResult.winner === 'team2') {
          await this.userService.updateUserResources(user.id, {
            gold: 20,
            experience: 20
          });
          rewardMessage = '\n💰 Награда за участие: 20 золота + 20 опыта';
        }

        await this.sendMessage(chatId, 
          `📜 Лог битвы:\n\n${battleResult.log}${rewardMessage}`
        );
      }

    } catch (error) {
      console.error('Battle error details:', {
        message: error.message,
        stack: error.stack,
        telegramId: telegramId
      });
      await this.sendMessage(chatId, 
        '❌ Ошибка в битве. Попробуйте позже или используйте текстовую версию через /manage_team.'
      );
    }
  }

  async handleUpgradeHero(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      if (heroes.length === 0) {
        await this.sendMessage(chatId, '❌ У вас нет героев для улучшения.');
        return;
      }

      const keyboard = {
        inline_keyboard: heroes.map(hero => [
          {
            text: `${hero.name} (Ур. ${hero.level}) - ${hero.level * 100} золота`,
            callback_data: `upgrade_hero_${hero.id}`
          }
        ])
      };

      await this.sendMessage(chatId, 
        '🎯 Выберите героя для улучшения:', 
        { reply_markup: keyboard }
      );

    } catch (error) {
      console.error('UpgradeHero error:', error);
      await this.sendMessage(chatId, '❌ Ошибка при улучшении героя.');
    }
  }

  async handleStats(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
  
    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const stats = await this.userService.getUserStats(user.id);

      const message = `
📊 Ваша статистика:

🏆 Уровень: ${stats.user.level}
⭐ Опыт: ${stats.user.experience}/${stats.user.level * 100}
💰 Золото: ${stats.user.gold}
💎 Самоцветы: ${stats.user.gems}

🎯 Героев: ${stats.heroesCount}
⚔️ Боёв: ${stats.battlesCount}
🏅 Побед: ${stats.winsCount}
📈 Win Rate: ${stats.winRate}%

💡 Используйте Web App для управления командой и битв!
      `;

      const keyboard = process.env.WEBHOOK_DOMAIN ? {
        inline_keyboard: [
          [
            {
              text: '👥 Управление командой',
              web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}` }
            }
          ],
          [
            {
              text: '⚔️ Начать битву',
              web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/battle?telegramId=${telegramId}` }
            }
          ]
        ]
      } : undefined;

      await this.sendMessage(chatId, message, {
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Stats error:', error);
      await this.sendMessage(chatId, '❌ Ошибка при получении статистики.');
    }
  }

  async handleBuyHero(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const result = await this.heroService.createRandomHero(user.id, 500);

      const keyboard = process.env.WEBHOOK_DOMAIN ? {
        inline_keyboard: [[
          {
            text: '👥 Добавить в команду (Web App)',
            web_app: { url: `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}` }
          }
        ]]
      } : undefined;

      await this.sendMessage(chatId,
        `✅ Вы купили нового героя!\n\n` +
        `🎯 Имя: ${result.hero.name}\n` +
        `⚔️ Класс: ${result.hero.heroClass}\n` +
        `❤️ Здоровье: ${result.hero.health}\n` +
        `⚔️ Атака: ${result.hero.attack}\n` +
        `🛡️ Защита: ${result.hero.defense}\n` +
        `🏃 Скорость: ${result.hero.speed}\n\n` +
        `💰 Потрачено: ${result.cost} золота\n` +
        `💳 Остаток золота: ${result.newGold}\n\n` +
        `Используйте /team чтобы добавить героя в команду через Web App`,
        {
          reply_markup: keyboard
        }
      );

    } catch (error) {
      console.error('BuyHero error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleManageTeam(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      // Проверяем наличие Web App
      if (process.env.WEBHOOK_DOMAIN) {
        const webAppUrl = `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${telegramId}`;
        
        await this.sendMessage(chatId, 
          `👥 Управление командой теперь в Web App!\n\n` +
          `В Web App вы можете:\n` +
          `• 📋 Видеть всех своих героев\n` +
          `• 🎯 Выбирать героев для команды\n` +
          `• 🔄 Менять состав одним кликом\n` +
          `• ✅ Контролировать дублирование героев\n` +
          `• ⚔️ Начать битву после сбора команды\n\n` +
          `Нажмите кнопку ниже чтобы открыть управление командой:`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🎯 Открыть управление командой',
                  web_app: { url: webAppUrl }
                }
              ]]
            }
          }
        );
      } else {
        // Старая текстовая версия
        const teamInfo = await this.userService.getTeamManagementInfo(telegramId);
        
        let message = `👥 Управление командой:\n\n`;
        
        if (teamInfo.activeTeam) {
          message += `🏷️ Название команды: ${teamInfo.activeTeam.name}\n`;
          message += `📍 Слотов занято: ${teamInfo.teamHeroes.length}/5\n\n`;
          
          if (teamInfo.teamHeroes.length > 0) {
            message += `🔷 Герои в команде:\n`;
            teamInfo.teamHeroes.forEach(hero => {
              message += `${hero.TeamHero.position}. ${hero.name} (ур. ${hero.level})\n`;
            });
          } else {
            message += `❌ В команде нет героев\n`;
          }
        } else {
          message += `❌ У вас нет активной команды\n`;
        }
        
        message += `\n🎯 Доступные герои (${teamInfo.allHeroes.length}):\n`;
        teamInfo.allHeroes.forEach((hero, index) => {
          const inTeam = teamInfo.teamHeroes.some(th => th.id === hero.id);
          const status = inTeam ? '✅ В команде' : '❌ Не в команде';
          message += `${index + 1}. ${hero.name} (${hero.heroClass}) - ур. ${hero.level} - ${status}\n`;
        });

        const keyboard = {
          inline_keyboard: [
            [
              { text: '🛒 Купить героя (500 золота)', callback_data: 'buy_hero' }
            ],
            [
              { text: '➕ Добавить героя в команду', callback_data: 'add_hero_menu' },
              { text: '➖ Убрать из команды', callback_data: 'remove_hero_menu' }
            ],
            [
              { text: '🔄 Обновить', callback_data: 'refresh_team' }
            ]
          ]
        };

        await this.sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }

    } catch (error) {
      console.error('ManageTeam error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    try {
      if (data.startsWith('upgrade_hero_')) {
        const heroId = data.replace('upgrade_hero_', '');
        const user = await this.userService.findByTelegramId(callbackQuery.from.id);
        
        const result = await this.heroService.upgradeHero(heroId, user.id);
        
        await this.sendMessage(chatId, 
          `✅ Герой ${result.hero.name} улучшен до уровня ${result.hero.level}!\n` +
          `❤️ Здоровье: +${result.increases.health}\n` +
          `⚔️ Атака: +${result.increases.attack}\n` +
          `🛡️ Защита: +${result.increases.defense}\n` +
          `🏃 Скорость: +${result.increases.speed}\n` +
          `💰 Потрачено: ${result.upgradeCost} золота`
        );

        await this.answerCallbackQuery(callbackQuery.id, {
          text: 'Герой улучшен!'
        });
      }
      else if (data === 'buy_hero') {
        const user = await this.userService.findByTelegramId(callbackQuery.from.id);
        const result = await this.heroService.createRandomHero(user.id, 500);

        await this.sendMessage(chatId,
          `✅ Вы купили нового героя!\n\n` +
          `🎯 Имя: ${result.hero.name}\n` +
          `⚔️ Класс: ${result.hero.heroClass}\n` +
          `❤️ Здоровье: ${result.hero.health}\n` +
          `⚔️ Атака: ${result.hero.attack}\n` +
          `🛡️ Защита: ${result.hero.defense}\n` +
          `🏃 Скорость: ${result.hero.speed}\n\n` +
          `💰 Потрачено: ${result.cost} золота\n` +
          `💳 Остаток золота: ${result.newGold}`
        );

        await this.answerCallbackQuery(callbackQuery.id, {
          text: 'Герой куплен!'
        });
      }
      else if (data === 'refresh_team') {
        await this.handleManageTeam({ chat: { id: chatId }, from: callbackQuery.from });
        await this.answerCallbackQuery(callbackQuery.id, {
          text: 'Обновлено!'
        });
      }
      else if (data === 'add_hero_menu') {
        await this.showAddHeroMenu(chatId, callbackQuery.from.id);
        await this.answerCallbackQuery(callbackQuery.id);
      }
      else if (data === 'remove_hero_menu') {
        await this.showRemoveHeroMenu(chatId, callbackQuery.from.id);
        await this.answerCallbackQuery(callbackQuery.id);
      }
      else if (data.startsWith('add_hero_')) {
        const heroId = data.replace('add_hero_', '');
        await this.addHeroToTeam(chatId, callbackQuery.from.id, heroId);
        await this.answerCallbackQuery(callbackQuery.id);
      }
      else if (data.startsWith('remove_hero_')) {
        const heroId = data.replace('remove_hero_', '');
        await this.removeHeroFromTeam(chatId, callbackQuery.from.id, heroId);
        await this.answerCallbackQuery(callbackQuery.id);
      }
      // CALLBACK ДЛЯ WEB APP
      else if (data === 'open_webapp_team') {
        if (process.env.WEBHOOK_DOMAIN) {
          const webAppUrl = `${process.env.WEBHOOK_DOMAIN}/webapp/team?telegramId=${callbackQuery.from.id}`;
          await this.answerCallbackQuery(callbackQuery.id, {
            text: 'Открываю Web App...',
            url: webAppUrl
          });
        } else {
          await this.answerCallbackQuery(callbackQuery.id, {
            text: 'Web App временно недоступен'
          });
        }
      }
      else if (data === 'open_webapp_battle') {
        if (process.env.WEBHOOK_DOMAIN) {
          const webAppUrl = `${process.env.WEBHOOK_DOMAIN}/webapp/battle?telegramId=${callbackQuery.from.id}`;
          await this.answerCallbackQuery(callbackQuery.id, {
            text: 'Начинаем битву...',
            url: webAppUrl
          });
        } else {
          await this.answerCallbackQuery(callbackQuery.id, {
            text: 'Web App временно недоступен'
          });
        }
      }

    } catch (error) {
      console.error('Callback query error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
      await this.answerCallbackQuery(callbackQuery.id, {
        text: 'Произошла ошибка'
      });
    }
  }

  async showAddHeroMenu(chatId, telegramId) {
    try {
      const teamInfo = await this.userService.getTeamManagementInfo(telegramId);
      
      if (!teamInfo.activeTeam) {
        await this.sendMessage(chatId, '❌ Сначала создайте команду с помощью /create_team');
        return;
      }

      if (teamInfo.teamHeroes.length >= 5) {
        await this.sendMessage(chatId, '❌ В команде уже максимальное количество героев (5)');
        return;
      }

      const availableHeroes = teamInfo.allHeroes.filter(hero => 
        !teamInfo.teamHeroes.some(th => th.id === hero.id)
      );

      if (availableHeroes.length === 0) {
        await this.sendMessage(chatId, 
          '❌ Нет доступных героев для добавления в команду.\n' +
          'Используйте /buy_hero чтобы купить новых героев!'
        );
        return;
      }

      const keyboard = {
        inline_keyboard: availableHeroes.map(hero => [
          {
            text: `${hero.name} (${hero.heroClass}) - ур. ${hero.level}`,
            callback_data: `add_hero_${hero.id}`
          }
        ])
      };

      await this.sendMessage(chatId, 
        `Выберите героя для добавления в команду (свободных слотов: ${5 - teamInfo.teamHeroes.length}):`,
        { reply_markup: keyboard }
      );

    } catch (error) {
      console.error('ShowAddHeroMenu error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async showRemoveHeroMenu(chatId, telegramId) {
    try {
      const teamInfo = await this.userService.getTeamManagementInfo(telegramId);
      
      if (!teamInfo.activeTeam || teamInfo.teamHeroes.length === 0) {
        await this.sendMessage(chatId, '❌ В команде нет героев для удаления');
        return;
      }

      const keyboard = {
        inline_keyboard: teamInfo.teamHeroes.map(hero => [
          {
            text: `${hero.TeamHero.position}. ${hero.name} (${hero.heroClass})`,
            callback_data: `remove_hero_${hero.id}`
          }
        ])
      };

      await this.sendMessage(chatId, 
        'Выберите героя для удаления из команды:',
        { reply_markup: keyboard }
      );

    } catch (error) {
      console.error('ShowRemoveHeroMenu error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async addHeroToTeam(chatId, telegramId, heroId) {
    try {
      const result = await this.userService.addHeroToTeam(telegramId, heroId);
      
      await this.sendMessage(chatId, 
        `✅ Герой добавлен в команду на позицию ${result.position}!`
      );

      await this.handleManageTeam({ chat: { id: chatId }, from: { id: telegramId } });

    } catch (error) {
      console.error('AddHeroToTeam error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async removeHeroFromTeam(chatId, telegramId, heroId) {
    try {
      await this.userService.removeHeroFromTeam(telegramId, heroId);
      
      await this.sendMessage(chatId, '✅ Герой удален из команды!');

      await this.handleManageTeam({ chat: { id: chatId }, from: { id: telegramId } });

    } catch (error) {
      console.error('RemoveHeroFromTeam error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleWebAppData(msg) {
    const data = JSON.parse(msg.web_app_data.data);
    const chatId = msg.chat.id;
    
    try {
      switch (data.action) {
        case 'upgrade_hero':
          await this.handleWebAppUpgrade(chatId, data);
          break;
        case 'create_team':
          await this.handleWebAppTeamCreation(chatId, data);
          break;
        default:
          await this.sendMessage(chatId, '❌ Неизвестное действие');
      }
    } catch (error) {
      console.error('WebApp data error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleWebAppUpgrade(chatId, data) {
    try {
      const result = await this.heroService.upgradeHero(data.heroId, data.userId);
      await this.sendMessage(chatId, 
        `✅ Герой ${result.hero.name} улучшен до уровня ${result.hero.level}!\n` +
        `❤️ Здоровье: +${result.increases.health}\n` +
        `⚔️ Атака: +${result.increases.attack}\n` +
        `🛡️ Защита: +${result.increases.defense}\n` +
        `🏃 Скорость: +${result.increases.speed}\n` +
        `💰 Потрачено: ${result.upgradeCost} золота`
      );
    } catch (error) {
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleWebAppTeamCreation(chatId, data) {
    await this.sendMessage(chatId, '✅ Команда создана через Web App!');
  }

  async handleFixGold(msg) {
   const chatId = msg.chat.id;
   const telegramId = msg.from.id;
 
   try {
     const user = await this.userService.findByTelegramId(telegramId);
     
     // Если у пользователя мало золота, добавляем
     if (user.gold < 5000) {
       const goldToAdd = 5000 - user.gold;
       await user.update({ gold: 5000 });
       
       await this.sendMessage(chatId,
         `🔧 Исправление баланса!\n\n` +
         `💰 Вам добавлено: ${goldToAdd} золота\n` +
         `💳 Теперь у вас: 5000 золота\n\n` +
         `🎮 Теперь вы можете купить недостающих героев!`
       );
     } else {
       await this.sendMessage(chatId,
         `✅ Ваш баланс в порядке!\n` +
         `💳 У вас: ${user.gold} золота`
       );
     }
 
   } catch (error) {
     console.error('Fix gold error:', error);
     await this.sendMessage(chatId, `❌ ${error.message}`);
   }
 }
}

module.exports = GameBot;
