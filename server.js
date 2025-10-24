require('dotenv').config();
const app = require('./app');
const db = require('./db/models');
const express = require('express');

const PORT = process.env.PORT || 8100;
const isDevelopment = process.env.NODE_ENV === 'development';
const useWebhook = process.env.USE_WEBHOOK === 'true';

console.log(`🚀 Starting in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`🌐 Webhook mode: ${useWebhook ? 'ENABLED' : 'DISABLED'}`);

// Инициализация сервисов
const UserService = require('./bot/services/userService');
const HeroService = require('./bot/services/heroService');
const BattleService = require('./bot/services/battleService');

const services = {
  models: db,
  userService: new UserService(db),
  heroService: new HeroService(db),
  battleService: new BattleService(db)
};

// Инициализация бота
let bot = null;
if (process.env.BOT_TOKEN) {
  const GameBot = require('./bot/bot');
  try {
    if (useWebhook) {
      // РЕЖИМ С WEBHOOK (и для разработки, и для продакшена)
      bot = new GameBot(process.env.BOT_TOKEN, { 
        polling: false 
      }, services);
      bot.setWebAppUrl(process.env.FRONTEND_URL);
      console.log('🤖 Telegram Bot initialized (WEBHOOK mode)');
    } else {
      // РЕЖИМ С POLLING (только для разработки)
      bot = new GameBot(process.env.BOT_TOKEN, { 
        polling: true 
      }, services);
      console.log('🔧 Telegram Bot initialized (POLLING mode)');
    }
  } catch (error) {
    console.error('❌ Bot init failed:', error.message);
  }
}

// Webhook endpoint для Telegram (только если используем webhook)
if (bot && useWebhook) {
  const webhookPath = `/webhook/${process.env.BOT_TOKEN}`;
  
  app.use(express.json());
  
  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  
  console.log(`🌐 Webhook configured at: ${webhookPath}`);
}

// API Routes
const apiRoutes = require('./routes/api')(db);
app.use('/api', apiRoutes);

// Маршрут для получения HTML управления командой
app.get('/webapp/team', async (req, res) => {
   try {
     const { telegramId } = req.query;
     
     if (!telegramId) {
       return res.status(400).send('Telegram ID required');
     }
 
     const teamData = await services.userService.getTeamForWebApp(parseInt(telegramId));
     const html = services.webAppService.generateTeamManagementHTML(telegramId, teamData);
     
     res.setHeader('Content-Type', 'text/html');
     res.send(html);
   } catch (error) {
     console.error('WebApp team error:', error);
     res.status(500).send('Error loading team management');
   }
 });
 
 // Маршрут для обновления команды
 app.post('/api/webapp/update-team', async (req, res) => {
   try {
     const { telegramId, heroIds } = req.body;
     
     const result = await services.userService.updateTeamFromWebApp(telegramId, heroIds);
     
     res.json({ success: true, ...result });
   } catch (error) {
     console.error('Update team error:', error);
     res.json({ success: false, message: error.message });
   }
 });
 
 // Маршрут для начала боя
 app.get('/webapp/battle', async (req, res) => {
   try {
     const { telegramId } = req.query;
     
     if (!telegramId) {
       return res.status(400).send('Telegram ID required');
     }
 
     // Получаем команду пользователя
     const user = await services.userService.findByTelegramId(parseInt(telegramId));
     const userTeam = await services.models.Team.findOne({
       where: { userId: user.id, isActive: true },
       include: [{ model: services.models.Hero }]
     });
 
     if (!userTeam || userTeam.Heroes.length !== 5) {
       return res.status(400).send('Need full team of 5 heroes');
     }
 
     // Получаем случайного противника
     const opponentTeam = await services.battleService.getRandomOpponentTeam(user.id);
     
     // Симулируем бой пошагово
     const battleSteps = await services.battleService.simulateBattleStepByStep(userTeam, opponentTeam);
     
     // Генерируем HTML для боя
     const html = services.webAppService.generateBattleHTML(battleSteps, userTeam, opponentTeam);
     
     res.setHeader('Content-Type', 'text/html');
     res.send(html);
   } catch (error) {
     console.error('WebApp battle error:', error);
     res.status(500).send('Error starting battle');
   }
 });

 
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    bot: !!bot,
    environment: process.env.NODE_ENV,
    mode: useWebhook ? 'webhook' : 'polling',
    domain: process.env.WEBHOOK_DOMAIN
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hero Wars Bot API',
    health: '/health',
    api: '/api',
    mode: useWebhook ? 'webhook' : 'polling',
    domain: process.env.WEBHOOK_DOMAIN
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Функция для установки webhook
async function setWebhook() {
  if (!bot || !useWebhook) return;
  
  try {
    const webhookUrl = `https://${process.env.WEBHOOK_DOMAIN}/webhook/${process.env.BOT_TOKEN}`;
    
    // Удаляем старый webhook если есть
    await bot.deleteWebHook();
    
    // Устанавливаем новый webhook
    const result = await bot.setWebHook(webhookUrl);
    
    console.log('✅ Webhook установлен:', webhookUrl);
    console.log('📊 Webhook info:', result);
    
  } catch (error) {
    console.error('❌ Webhook setup failed:', error.message);
  }
}

const startServer = async () => {
  try {
    // Проверка подключения к БД
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('🚀 Starting server...');
    const server = app.listen(PORT, async () => {
      console.log(`✅ Server running on port ${PORT}`);
      
      // Устанавливаем webhook после запуска сервера (если используем webhook)
      if (useWebhook) {
        await setWebhook();
      } else {
        console.log('🔧 Polling mode - webhook not required');
      }
    });
    
  } catch (error) {
    console.error('❌ Server start failed:', error);
    process.exit(1);
  }
};

startServer();
