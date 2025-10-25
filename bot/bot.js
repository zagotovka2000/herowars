require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { User, Hero, Team, TeamHero } = require('../db/models');
class GameBot extends TelegramBot {
  constructor(token, options, services) {
    console.log('🤖 Bot constructor called');
    
    if (!token) {
      throw new Error('BOT_TOKEN is required');
    }

    super(token, options);
    
    if (!services) {
      console.warn('⚠️ No services provided to bot');
      services = {};
    }
    
    this.models = services.models || {};
    this.userService = services.userService || null;
    this.heroService = services.heroService || null;
    this.battleService = services.battleService || null;
    this.webAppService = services.webAppService || null;
    
    console.log('✅ Bot services initialized');
    
    this.bindAllMethods();
    this.initHandlers();
  }

 
  bindAllMethods() {
    try {
      const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        .filter(name => name !== 'constructor' && typeof this[name] === 'function');
      
      methodNames.forEach(methodName => {
        this[methodName] = this[methodName].bind(this);
      });
      console.log(`✅ Bound ${methodNames.length} methods`);
    } catch (error) {
      console.error('❌ Error binding methods:', error);
    }
  }

  initHandlers() {
    try {
      // Базовые команды
      this.onText(/\/start/, this.handleStart);
      this.onText(/\/test/, this.handleTest);
      this.onText(/\/battle/, this.handleBattle);
      this.onText(/\/my_heroes/, this.handleMyHeroes);
      this.onText(/\/stats/, this.handleStats);
      this.onText(/\/buy_hero/, this.handleBuyHero);
      this.onText(/\/manage_team/, this.handleManageTeam);
      this.onText(/\/create_team/, this.handleCreateTeam);
      this.onText(/\/upgrade_hero/, this.handleUpgradeHero);
      this.onText(/\/fix_gold/, this.handleFixGold);
      this.onText(/\/sync_team/, this.handleSyncTeam);
      this.onText(/\/reset_team/, this.handleResetTeam);


      
      console.log('✅ All handlers registered');
      
      // Callback queries
      this.on('callback_query', this.handleCallbackQuery);
      this.on('web_app_data', this.handleWebAppData);
      
      // Обработчики ошибок
      this.on('polling_error', (error) => {
        console.error('🔴 Polling error:', error.message);
      });
      
      this.on('webhook_error', (error) => {
        console.error('🔴 Webhook error:', error.message);
      });
      
    } catch (error) {
      console.error('❌ Error initializing handlers:', error);
    }
  }
  async handleSyncTeam(msg) {
   const chatId = msg.chat.id;
   const telegramId = msg.from.id;
 
   try {
     const syncResult = await this.userService.syncTeamData(telegramId);
     
     if (syncResult.success) {
       await this.sendMessage(chatId,
         `🔄 Синхронизация данных команды:\n\n` +
         `🏷️ ID команды: ${syncResult.teamId}\n` +
         `👥 Героев в команде: ${syncResult.heroesCount}\n\n` +
         `📋 Состав команды:\n` +
         (syncResult.heroes.length > 0 ? 
           syncResult.heroes.map(h => `${h.position}. ${h.name} (ID: ${h.id})`).join('\n') :
           '❌ В команде нет героев')
       );
     } else {
       await this.sendMessage(chatId, syncResult.message);
     }
   } catch (error) {
     console.error('Sync team error:', error);
     await this.sendMessage(chatId, `❌ Ошибка синхронизации: ${error.message}`);
   }
 }
 async handleResetTeam(msg) {
   const chatId = msg.chat.id;
   const telegramId = msg.from.id;
 
   try {
     const user = await this.userService.findByTelegramId(telegramId);
     const team = await this.models.Team.findOne({
       where: { userId: user.id, isActive: true }
     });
 
     if (!team) {
       await this.sendMessage(chatId, '❌ Активная команда не найдена');
       return;
     }
 
     // Удаляем все связи команды с героями
     await this.models.TeamHero.destroy({
       where: { teamId: team.id }
     });
 
     console.log('✅ Команда сброшена:', { teamId: team.id });
 
     await this.sendMessage(chatId,
       `🔄 Команда "${team.name}" полностью сброшена!\n\n` +
       `Все герои удалены из команды.\n` +
       `Теперь вы можете заново собрать команду через /manage_team`
     );
 
   } catch (error) {
     console.error('Reset team error:', error);
     await this.sendMessage(chatId, `❌ Ошибка сброса команды: ${error.message}`);
   }
 }
  // Проверка доступности Web App
  isWebAppAvailable() {
    const hasDomain = process.env.WEBHOOK_DOMAIN && process.env.WEBHOOK_DOMAIN !== 'localhost:8100';
    const isHttps = hasDomain && process.env.WEBHOOK_DOMAIN.startsWith('https://');
    return hasDomain && isHttps;
  }

  // Генерация безопасного Web App URL
  getWebAppUrl(path, telegramId) {
    if (!this.isWebAppAvailable()) {
      return null;
    }
    
    // Убедимся, что домен начинается с https://
    let domain = process.env.WEBHOOK_DOMAIN;
    if (!domain.startsWith('https://')) {
      domain = `https://${domain}`;
    }
    
    return `${domain}${path}?telegramId=${telegramId}`;
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    console.log(`👤 Start command from ${username} (${telegramId})`);

    try {
      let user = null;
      
      if (this.userService) {
        user = await this.userService.findOrCreate(telegramId, username);
      }
      
      const message = user ? 
        `🎮 Добро пожаловать, ${username}!\n\n` +
        `🏆 Уровень: ${user.level}\n` +
        `💰 Золото: ${user.gold}\n` +
        `💎 Изумруды: ${user.gems}\n\n` +
        `Доступные команды:\n` +
        `/test - Проверка бота\n` +
        `/battle - Начать битву\n` +
        `/my_heroes - Мои герои\n` +
        `/stats - Статистика\n` +
        `/buy_hero - Купить героя\n` +
        `/manage_team - Управление командой` :
        `🎮 Добро пожаловать в Hero Wars Bot!\n\n` +
        `🔧 Режим: Базовая версия\n` +
        `💡 Используйте /test для проверки`;

      // Проверяем доступность Web App
      const webAppUrl = this.getWebAppUrl('/webapp/team', telegramId);
      const keyboard = webAppUrl ? {
        inline_keyboard: [
          [
            {
              text: '👥 Управление командой (Web App)',
              web_app: { url: webAppUrl }
            }
          ]
        ]
      } : undefined;

      await this.sendMessage(chatId, message, {
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Start error:', error);
      await this.sendMessage(chatId, 
        `❌ Ошибка при запуске: ${error.message}\n\n` +
        `💡 Используйте /test для проверки работы бота`
      );
    }
  }

  async handleTest(msg) {
    const chatId = msg.chat.id;
    
    try {
      const servicesStatus = {
        userService: !!this.userService,
        heroService: !!this.heroService,
        battleService: !!this.battleService,
        models: !!this.models
      };
      
      const webAppStatus = this.isWebAppAvailable() ? 
        `✅ Доступен (${process.env.WEBHOOK_DOMAIN})` : 
        '❌ Недоступен (требуется HTTPS)';
      
      await this.sendMessage(chatId, 
        `✅ Тест пройден успешно!\n\n` +
        `🕒 Время: ${new Date().toLocaleString()}\n` +
        `🔧 Режим: ${process.env.NODE_ENV || 'development'}\n` +
        `🌐 Webhook: ${process.env.USE_WEBHOOK === 'true' ? 'Включен' : 'Выключен'}\n` +
        `📱 Web App: ${webAppStatus}\n` +
        `🏗️ Сервисы: ${Object.values(servicesStatus).filter(Boolean).length}/${Object.values(servicesStatus).length}\n` +
        `💡 Бот работает корректно!`
      );
    } catch (error) {
      console.error('Test command error:', error);
      await this.sendMessage(chatId, 
        `❌ Ошибка теста: ${error.message}`
      );
    }
  }

  async handleBattle(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    console.log(`⚔️ Battle command from ${telegramId}`);

    try {
      // Проверяем доступность сервисов
      if (!this.userService || !this.battleService) {
        throw new Error('Сервисы битвы недоступны');
      }

      const user = await this.userService.findByTelegramId(telegramId);
      console.log(`👤 User found: ${user.username}`);

      const activeTeam = await this.models.Team.findOne({
        where: { userId: user.id, isActive: true },
        include: [{ model: this.models.Hero }]
      });

      // ИСПРАВЛЕНИЕ: Добавляем проверку на существование Heroes
      if (!activeTeam || !activeTeam.Heroes || activeTeam.Heroes.length !== 5) {
        await this.sendMessage(chatId, 
          '❌ У вас нет активной команды из 5 героев!\n\n' +
          'Создайте команду:\n' +
          '/create_team - создать команду\n' +
          '/buy_hero - купить героев\n' +
          '/manage_team - управление командой'
        );
        return;
      }

      // Проверяем доступность Web App для битвы
      const webAppUrl = this.getWebAppUrl('/webapp/battle', telegramId);
      
      if (webAppUrl) {
        // Web App версия
        await this.sendMessage(chatId, 
          `⚔️ Битва в Web App!\n\n` +
          `Ваша команда готова:\n` +
          `${activeTeam.Heroes.map((h, i) => `${i + 1}. ${h.name} (${h.heroClass})`).join('\n')}\n\n` +
          `Нажмите кнопку ниже для визуальной битвы!`,
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
        // Текстовая версия битвы
        await this.sendMessage(chatId, '⚔️ Ищем противника...');

        const opponent = await this.userService.findRandomOpponent(user.id);
        const opponentTeam = await this.models.Team.findOne({
          where: { userId: opponent.id, isActive: true },
          include: [{ model: this.models.Hero }]
        });

        // ИСПРАВЛЕНИЕ: Проверяем opponentTeam и его Heroes
        if (!opponentTeam || !opponentTeam.Heroes || opponentTeam.Heroes.length !== 5) {
          await this.sendMessage(chatId, '❌ Не удалось найти подходящего противника.');
          return;
        }

        console.log(`🎯 Starting battle: ${user.username} vs ${opponent.username}`);

        const battleResult = await this.battleService.simulateBattle(activeTeam, opponentTeam);
        
        // Сохраняем результат битвы
        await this.models.Battle.create({
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
        } else {
          await this.userService.updateUserResources(user.id, {
            gold: 50,
            experience: 30
          });
          rewardMessage = '\n💰 Награда за ничью: 50 золота + 30 опыта';
        }

        await this.sendMessage(chatId, 
          `📜 Результат битвы:\n\n${battleResult.log}${rewardMessage}`
        );

        console.log(`✅ Battle completed for ${user.username}`);
      }

    } catch (error) {
      console.error('🔴 Battle error details:', {
        message: error.message,
        stack: error.stack,
        telegramId: telegramId
      });
      
      await this.sendMessage(chatId, 
        '❌ Ошибка в битве. Возможные причины:\n\n' +
        '• Недостаточно героев в команде\n' +
        '• Проблемы с базой данных\n' +
        '• Ошибка в сервисах\n\n' +
        '💡 Попробуйте:\n' +
        '/test - проверить бота\n' +
        '/create_team - создать команду\n' +
        '/fix_gold - пополнить баланс'
      );
    }
  }

  async handleMyHeroes(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      if (!this.userService || !this.heroService) {
        throw new Error('Сервисы недоступны');
      }

      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      if (!heroes || heroes.length === 0) {
        await this.sendMessage(chatId, 
          '❌ У вас пока нет героев.\n' +
          'Используйте /buy_hero чтобы купить первого героя!'
        );
        return;
      }

      let message = '🎯 Ваши герои:\n\n';
      heroes.forEach((hero, index) => {
        message += `${index + 1}. ${hero.name} (${hero.heroClass})\n`;
        message += `   Ур. ${hero.level} | ❤️ ${hero.health} | ⚔️ ${hero.attack}\n`;
        message += `   🛡️ ${hero.defense} | 🏃 ${hero.speed}\n\n`;
      });

      message += `💡 Всего героев: ${heroes.length}`;

      await this.sendMessage(chatId, message);

    } catch (error) {
      console.error('MyHeroes error:', error);
      await this.sendMessage(chatId, '❌ Ошибка при получении списка героев.');
    }
  }

  async handleStats(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
  
    try {
      if (!this.userService) {
        throw new Error('Сервис пользователя недоступен');
      }

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
      // Проверяем доступность Web App
      const webAppUrl = this.getWebAppUrl('/webapp/team', telegramId);
      
      if (webAppUrl) {
        // Web App версия
        await this.sendMessage(chatId, 
          `👥 Управление командой в Web App!\n\n` +
          `В Web App вы можете:\n` +
          `• 📋 Видеть всех героев\n` +
          `• 🎯 Выбирать команду\n` +
          `• 🔄 Менять состав\n` +
          `• ✅ Контролировать дубли\n\n` +
          `Нажмите кнопку ниже:`,
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
        // Текстовая версия
        const teamInfo = await this.userService.getTeamManagementInfo(telegramId);
        
        let message = `👥 Управление командой:\n\n`;
        
        if (teamInfo.activeTeam) {
          message += `🏷️ Название: ${teamInfo.activeTeam.name}\n`;
          message += `📍 Слотов: ${teamInfo.teamHeroes ? teamInfo.teamHeroes.length : 0}/5\n\n`;
          
          if (teamInfo.teamHeroes && teamInfo.teamHeroes.length > 0) {
            message += `🔷 Герои в команде:\n`;
            teamInfo.teamHeroes.forEach(hero => {
              message += `${hero.TeamHero.position}. ${hero.name} (ур. ${hero.level})\n`;
            });
          } else {
            message += `❌ В команде нет героев\n`;
          }
        } else {
          message += `❌ Нет активной команды\n`;
        }
        
        message += `\n🎯 Доступные герои: ${teamInfo.allHeroes ? teamInfo.allHeroes.length : 0}\n`;
        
        if (teamInfo.allHeroes) {
          teamInfo.allHeroes.forEach((hero, index) => {
            const inTeam = teamInfo.teamHeroes && teamInfo.teamHeroes.some(th => th.id === hero.id);
            const status = inTeam ? '✅ В команде' : '❌ Не в команде';
            message += `${index + 1}. ${hero.name} (${hero.heroClass}) - ${status}\n`;
          });
        }

        const keyboard = {
          inline_keyboard: [
            [
              { text: '🛒 Купить героя (500 золота)', callback_data: 'buy_hero' }
            ],
            [
              { text: '➕ Добавить героя', callback_data: 'add_hero_menu' },
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

  async handleCreateTeam(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      // ИСПРАВЛЕНИЕ: Проверяем наличие heroes
      if (!heroes || heroes.length < 5) {
        await this.sendMessage(chatId, 
          `❌ Недостаточно героев для команды.\n\n` +
          `Нужно: 5 героев\n` +
          `У вас: ${heroes ? heroes.length : 0} героев\n\n` +
          `Используйте /buy_hero чтобы купить героев`
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

      await this.sendMessage(chatId, 
        `✅ Команда создана!\n\n` +
        `В команду добавлены:\n` +
        `${heroes.slice(0, 5).map((h, i) => `${i + 1}. ${h.name} (${h.heroClass})`).join('\n')}\n\n` +
        `Используйте /manage_team для настройки команды`
      );

    } catch (error) {
      console.error('CreateTeam error:', error);
      await this.sendMessage(chatId, `❌ ${error.message}`);
    }
  }

  async handleUpgradeHero(msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      const heroes = await this.heroService.getUserHeroes(user.id);

      if (!heroes || heroes.length === 0) {
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

  async handleCallbackQuery(callbackQuery) {
   const chatId = callbackQuery.message.chat.id;
   const data = callbackQuery.data;
   const user = await this.userService.findByTelegramId(callbackQuery.from.id);

   console.log(`🔘 Callback: ${data} from ${callbackQuery.from.id}`);

   try {
     if (data.startsWith('upgrade_hero_')) {
       const heroId = data.replace('upgrade_hero_', '');
       
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
     // Добавление героя - ДОЛЖНО БЫТЬ НА ТОМ ЖЕ УРОВНЕ, ЧТО И ДРУГИЕ УСЛОВИЯ
     else if (data.startsWith('add_hero_')) {
       const heroId = data.split('_')[2];
       await this.addHeroToTeam(callbackQuery, user, heroId);
     }
     // Удаление героя - ДОЛЖНО БЫТЬ НА ТОМ ЖЕ УРОВНЕ
     else if (data.startsWith('remove_hero_')) {
       const heroId = data.split('_')[2];
       await this.removeHeroFromTeam(callbackQuery, user, heroId);
     }
     // Меню удаления героя - ДОЛЖНО БЫТЬ НА ТОМ ЖЕ УРОВНЕ
     else if (data === 'remove_hero_menu') {
       await this.showRemoveHeroMenu(callbackQuery, user);
     }
     // Сброс команды
     else if (data === 'reset_team') {
       await this.handleResetTeam({ chat: { id: chatId }, from: callbackQuery.from });
       await this.answerCallbackQuery(callbackQuery.id, {
         text: 'Команда сброшена!'
       });
     }
     // Назад в главное меню
     else if (data === 'back_to_main') {
       await this.showMainMenu(chatId, user);
       await this.answerCallbackQuery(callbackQuery.id);
     }
     // Управление командой
     else if (data === 'team_management') {
       await this.handleManageTeam({ chat: { id: chatId }, from: callbackQuery.from });
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

  async showAddHeroMenu(chatId, telegramId) {
    try {
      const teamInfo = await this.userService.getTeamManagementInfo(telegramId);
      
      if (!teamInfo.activeTeam) {
        await this.sendMessage(chatId, '❌ Сначала создайте команду с помощью /create_team');
        return;
      }

      // ИСПРАВЛЕНИЕ: Проверяем teamHeroes
      if (teamInfo.teamHeroes && teamInfo.teamHeroes.length >= 5) {
        await this.sendMessage(chatId, '❌ В команде уже максимальное количество героев (5)');
        return;
      }

      const availableHeroes = teamInfo.allHeroes ? 
        teamInfo.allHeroes.filter(hero => 
          !teamInfo.teamHeroes || !teamInfo.teamHeroes.some(th => th.id === hero.id)
        ) : [];

      if (!availableHeroes || availableHeroes.length === 0) {
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

      const currentCount = teamInfo.teamHeroes ? teamInfo.teamHeroes.length : 0;
      await this.sendMessage(chatId, 
        `Выберите героя для добавления в команду (свободных слотов: ${5 - currentCount}):`,
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
      
      // ИСПРАВЛЕНИЕ: Проверяем teamHeroes
      if (!teamInfo.activeTeam || !teamInfo.teamHeroes || teamInfo.teamHeroes.length === 0) {
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
  async showTeamManagement(ctx, user) {
   try {
     const teamInfo = await this.userService.getTeamManagementInfo(user.id);
     
     console.log('🔍 DEBUG TeamManagementInfo for display:', teamInfo);
     
     let message = `🏆 Управление командой\n\n`;
     
     // Всегда показываем текущее состояние команды
     message += `👥 Герои в команде (${teamInfo.heroesCount}/5):\n\n`;
     
     if (teamInfo.heroesCount === 0) {
       message += `❌ В вашей команде пока нет героев.\n`;
     } else {
       teamInfo.heroes.forEach((hero, index) => {
         message += `${index + 1}. ${hero.name} (${hero.heroClass})\n`;
         message += `   ⚔️ Атака: ${hero.attack} ❤️ Здоровье: ${hero.health}\n`;
         message += `   🛡️ Защита: ${hero.defense} 🏃 Скорость: ${hero.speed}\n\n`;
       });
     }
     
     const keyboard = [];
     
     // Кнопки добавления/удаления
     if (teamInfo.heroesCount < 5) {
       keyboard.push([{ text: '➕ Добавить героя', callback_data: 'add_hero_menu' }]);
     }
     
     if (teamInfo.heroesCount > 0) {
       keyboard.push([{ text: '➖ Удалить героя', callback_data: 'remove_hero_menu' }]);
     }
     
     keyboard.push([{ text: '🔄 Обновить', callback_data: 'refresh_team' }]);
     keyboard.push([{ text: '🎯 Сбросить команду', callback_data: 'reset_team' }]);
     keyboard.push([{ text: '⬅️ Назад', callback_data: 'back_to_main' }]);
     
     if (ctx.updateType === 'callback_query') {
       await ctx.editMessageText(message, { 
         reply_markup: { inline_keyboard: keyboard },
         parse_mode: 'Markdown'
       });
     } else {
       await ctx.reply(message, {
         reply_markup: { inline_keyboard: keyboard },
         parse_mode: 'Markdown'
       });
     }
   } catch (error) {
     console.error('Error showing team management:', error);
     await ctx.reply('❌ Произошла ошибка при загрузке команды');
   }
 }
 async addHeroToTeam(callbackQuery, user, heroId) {
   try {
     const chatId = callbackQuery.message.chat.id;
     console.log('🔍 DEBUG: Adding hero to team:', { userId: user.id, heroId });
     
     const result = await this.userService.addHeroToTeam(user.id, heroId);
     
     if (result.success) {
       // Обновляем сообщение с управлением командой
       await this.handleManageTeam({ 
         chat: { id: chatId }, 
         from: { id: user.telegramId } 
       });
       await this.answerCallbackQuery(callbackQuery.id, {
         text: 'Герой добавлен в команду!'
       });
     } else {
       await this.answerCallbackQuery(callbackQuery.id, { 
         text: result.message || '❌ Не удалось добавить героя',
         show_alert: true 
       });
     }
   } catch (error) {
     console.error('AddHeroToTeam error:', error);
     await this.answerCallbackQuery(callbackQuery.id, { 
       text: '❌ Ошибка при добавлении героя',
       show_alert: true 
     });
   }
 }
 
 async showRemoveHeroMenu(callbackQuery, user) {
   try {
     const chatId = callbackQuery.message.chat.id;
     const teamInfo = await this.userService.getTeamManagementInfo(user.id);
     
     if (teamInfo.heroesCount === 0) {
       await this.answerCallbackQuery(callbackQuery.id, { 
         text: '❌ В команде нет героев для удаления',
         show_alert: true 
       });
       return;
     }
     
     let message = `➖ Удаление героев из команды\n\n`;
     message += `Выберите героя для удаления:\n\n`;
     
     const keyboard = [];
     
     teamInfo.heroes.forEach(hero => {
       keyboard.push([{
         text: `${hero.name} (${hero.heroClass}) - Позиция ${hero.position}`,
         callback_data: `remove_hero_${hero.id}`
       }]);
     });
     
     keyboard.push([{ text: '⬅️ Назад', callback_data: 'team_management' }]);
     
     await this.editMessageText(chatId, callbackQuery.message.message_id, message, {
       reply_markup: { inline_keyboard: keyboard }
     });
     
     await this.answerCallbackQuery(callbackQuery.id);
   } catch (error) {
     console.error('Error showing remove hero menu:', error);
     await this.answerCallbackQuery(callbackQuery.id, { 
       text: '❌ Ошибка при загрузке меню удаления',
       show_alert: true 
     });
   }
 }
 async removeHeroFromTeam(callbackQuery, user, heroId) {
   try {
     const result = await this.userService.removeHeroFromTeam(user.id, heroId);
     
     if (result.success) {
       // Обновляем сообщение с управлением командой
       await this.handleManageTeam({ 
         chat: { id: callbackQuery.message.chat.id }, 
         from: { id: user.telegramId } 
       });
       await this.answerCallbackQuery(callbackQuery.id, {
         text: result.message
       });
     } else {
       await this.answerCallbackQuery(callbackQuery.id, { 
         text: result.message,
         show_alert: true 
       });
     }
   } catch (error) {
     console.error('RemoveHeroFromTeam error:', error);
     await this.answerCallbackQuery(callbackQuery.id, { 
       text: '❌ Ошибка при удалении героя',
       show_alert: true 
     });
   }
 }
 
 
 async showRemoveHeroMenu(ctx, user) {
   try {
     const teamInfo = await this.userService.getTeamManagementInfo(user.id);
     
     if (teamInfo.heroesCount === 0) {
       await ctx.answerCallbackQuery({ 
         text: '❌ В команде нет героев для удаления',
         show_alert: true 
       });
       return;
     }
     
     let message = `➖ Удаление героев из команды\n\n`;
     message += `Выберите героя для удаления:\n\n`;
     
     const keyboard = [];
     
     teamInfo.heroes.forEach(hero => {
       keyboard.push([{
         text: `${hero.name} (${hero.heroClass}) - Позиция ${hero.position}`,
         callback_data: `remove_hero_${hero.id}`
       }]);
     });
     
     keyboard.push([{ text: '⬅️ Назад', callback_data: 'team_management' }]);
     
     await ctx.editMessageText(message, {
       reply_markup: { inline_keyboard: keyboard }
     });
   } catch (error) {
     console.error('Error showing remove hero menu:', error);
     await ctx.answerCallbackQuery({ 
       text: '❌ Ошибка при загрузке меню удаления',
       show_alert: true 
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
