require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

class GameBot extends TelegramBot {
  constructor(token, options, services) {
    super(token, options);
    this.models = services.models;// Доступ к БД
    this.userService = services.userService;// Работа с пользователями
    this.heroService = services.heroService;// Управление героями
    this.battleService = services.battleService;// Логика битв
    
    // Привязываем контекст для всех методов
    this.handleStart = this.handleStart.bind(this);//приветственное сообщение, создание пользователя, отправка кнопки для Web App.
    this.handleMyHeroes = this.handleMyHeroes.bind(this);//показывает список героев пользователя
    this.handleCreateTeam = this.handleCreateTeam.bind(this);//5 героев
    this.handleBattle = this.handleBattle.bind(this);//ищет противника, проводит битву, сохраняет результат и выдает награды
    this.handleUpgradeHero = this.handleUpgradeHero.bind(this);//показывает inline клавиатуру для выбора героя для улучшения
    this.handleStats = this.handleStats.bind(this);
    this.handleWebAppData = this.handleWebAppData.bind(this);//обрабатывает данные, пришедшие из Web App
    this.handleCallbackQuery = this.handleCallbackQuery.bind(this);//обрабатывает нажатия на inline кнопки (например, улучшение героя).
    
    this.initHandlers();
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
    this.onText(/\/my_heroes/, this.handleMyHeroes);
    this.onText(/\/manage_team/, this.handleManageTeam);
    
    // Callback queries для inline клавиатур
    this.on('callback_query', this.handleCallbackQuery);
    
    // Web App данные
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
🤖 Добро пожаловать в Hero Wars Bot!

🎉 Вам начислены стартовые бонусы:
💰 5000 золота
💎 200 самоцветов
🎯 5 героев разных классов
⚔️ Готовая команда из 5 героев

Ваш аккаунт:
🏆 Уровень: ${user.level}
💰 Золото: ${user.gold}
💎 Изумруды: ${user.gems}

Доступные команды:
/my_heroes - Ваши герои
/create_team - Настроить команду
/battle - Найти противника
/upgrade_hero - Улучшить героя
/stats - Статистика

Или откройте полный игровой интерфейс через Web App!
    `;

      const keyboard = {
         inline_keyboard: [[
           {
             text: '🎮 Открыть игровой интерфейс',
           
               url:  `https://frontend-herowars.vercel.app/game` 
             
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

  async handleMyHeroes(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      if (heroes.length === 0) {
        await this.sendMessage(chatId, '❌ У вас пока нет героев.');
        return;
      }

      let message = '🎯 Ваши герои:\n\n';
      heroes.forEach((hero, index) => {
        message += `${index + 1}. ${hero.name} (Ур. ${hero.level})\n`;
        message += `   ❤️ ${hero.health} | ⚔️ ${hero.attack} | 🛡️ ${hero.defense}\n`;
        message += `   🏃 ${hero.speed} | 🎯 ${(hero.criticalChance * 100).toFixed(1)}% | 💥 ${hero.criticalDamage.toFixed(1)}x\n\n`;
      });

      await this.sendMessage(chatId, message);

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
          `❌ У вас недостаточно героев для создания команды. Нужно 5 героев, у вас: ${heroes.length}`
        );
        return;
      }

      // Создаем новую команду
      const team = await this.models.Team.create({
        name: `Команда ${user.username}`,
        isActive: true,
        userId: user.id
      });

      // Деактивируем другие команды пользователя
      await this.models.Team.update(
        { isActive: false },
        { 
          where: { 
            userId: user.id,
            id: { [this.models.Sequelize.Op.ne]: team.id }
          }
        }
      );

      // Добавляем первых 5 героев в команду
      for (let i = 0; i < 5; i++) {
        await this.heroService.addHeroToTeam(heroes[i].id, team.id, i + 1);
      }

      await this.sendMessage(chatId, 
         `✅ Команда создана!\n\n` +
         `В команду добавлены:\n` +
         `${heroes.slice(0, 5).map((h, i) => `${i + 1}. ${h.name} (${h.heroClass})`).join('\n')}\n\n` +
         `Используйте /manage_team для настройки состава команды`
       );

    } catch (error) {
      console.error('CreateTeam error:', error);
      await this.sendMessage(chatId, '❌ Ошибка при создании команды.');
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

      await this.sendMessage(chatId, '⚔️ Поиск противника...');

      // Поиск противника
      const opponent = await this.userService.findRandomOpponent(user.id);
      const opponentTeam = await this.models.Team.findOne({
        where: { userId: opponent.id, isActive: true },
        include: [{ model: this.models.Hero }]
      });

      if (!opponentTeam || opponentTeam.Heroes.length !== 5) {
        await this.sendMessage(chatId, '❌ Не удалось найти подходящего противника.');
        return;
      }

      // Симуляция битвы
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

    } catch (error) {
      console.error('Battle error:', error);
      await this.sendMessage(chatId, '❌ Ошибка в битве. Попробуйте позже.');
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

      // Создаем клавиатуру для выбора героя
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
    const keyboard = {
      inline_keyboard: [[
        {
          text: '🎮 Открыть игровой интерфейс',
          web_app: { url: this.webAppUrl || process.env.FRONTEND_URL }
        }
      ]]
    };
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
      `;

      await this.sendMessage(chatId, message);

    } catch (error) {
      console.error('Stats error:', error);
      await this.sendMessage(chatId, '❌ Ошибка при получении статистики.');
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

   } catch (error) {
     console.error('Callback query error:', error);
     await this.sendMessage(chatId, `❌ ${error.message}`);
     await this.answerCallbackQuery(callbackQuery.id, {
       text: 'Произошла ошибка'
     });
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
          await this.handleWebAppTeam(chatId, data);
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

  async handleWebAppTeam(chatId, data) {
    // Реализация создания команды через Web App
    await this.sendMessage(chatId, '✅ Команда создана через Web App!');
  }

  async handleBuyHero(msg) {
   const chatId = msg.chat.id;
   const telegramId = msg.from.id;
 
   try {
     const user = await this.userService.findByTelegramId(telegramId);
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
       `💳 Остаток золота: ${result.newGold}\n\n` +
       `Используйте /manage_team чтобы добавить героя в команду`
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
 
     // Создаем клавиатуру для управления
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
 
   } catch (error) {
     console.error('ManageTeam error:', error);
     await this.sendMessage(chatId, `❌ ${error.message}`);
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
     message += `💡 Используйте /manage_team чтобы управлять командой`;
 
     await this.sendMessage(chatId, message);
 
   } catch (error) {
     console.error('MyHeroes error:', error);
     await this.sendMessage(chatId, '❌ Ошибка при получении списка героев.');
   }
 }

}

module.exports = GameBot;
