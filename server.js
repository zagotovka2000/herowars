require('dotenv').config();
const app = require('./app');
const db = require('./db/models');
const express = require('express');

const PORT = process.env.PORT || 8100;

const isDevelopment = process.env.NODE_ENV === 'development';
console.log(`🚀 Starting in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);

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
     if (isDevelopment) {
       // РЕЖИМ РАЗРАБОТКИ - используем polling
       bot = new GameBot(process.env.BOT_TOKEN, { 
         polling: true 
       }, services);
       console.log('🔧 Telegram Bot initialized (POLLING mode)');
     } else {
       // РЕЖИМ ПРОДАКШЕНА - используем webhook
       bot = new GameBot(process.env.BOT_TOKEN, { 
         polling: false 
       }, services);
       bot.setWebAppUrl(process.env.FRONTEND_URL);
       console.log('🤖 Telegram Bot initialized (WEBHOOK mode)');
     }
   } catch (error) {
     console.error('❌ Bot init failed:', error.message);
   }
 }

// API Routes
const apiRoutes = require('./routes/api')(db);
app.use('/api', apiRoutes);

// Webhook endpoint для Telegram
if (bot) {
   // Создаем webhook endpoint
   const webhookPath = `/webhook/${process.env.BOT_TOKEN}`;
   
   app.use(express.json()); // Для парсинга JSON от Telegram
   
   app.post(webhookPath, (req, res) => {
     bot.processUpdate(req.body);
     res.sendStatus(200);
   });
   
   console.log(`🌐 Webhook configured at: ${webhookPath}`);
 }

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    bot: !!bot,
    environment: process.env.NODE_ENV,
    mode: 'webhook'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hero Wars Bot API',
    health: '/health',
    api: '/api',
    mode: 'webhook'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Функция для установки webhook
async function setWebhook() {
   if (!bot) return;
   
   try {
     const webhookUrl = `https://${process.env.WEBHOOK_DOMAIN || 'herowars.alwaysdata.net'}/webhook/${process.env.BOT_TOKEN}`;
     
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
       
       // Устанавливаем webhook после запуска сервера
       await setWebhook();
     });
     
   } catch (error) {
     console.error('❌ Server start failed:', error);
     process.exit(1);
   }
 };
 
startServer();
