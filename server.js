const app = require('./app');
const express = require('express');
const path = require('path');
const db = require('./db/models');
const GameBot = require('./bot/bot');
const UserService = require('./bot/services/userService');
const HeroService = require('./bot/services/heroService');
const BattleService = require('./bot/services/battleService');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting Hero Wars Bot Server...');

    // Проверка подключения к базе данных
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // Синхронизация базы данных (в development)
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ force: false });
      console.log('✅ Database synchronized');
    }

    // Инициализация сервисов
    const userService = new UserService(db);
    const heroService = new HeroService(db);
    const battleService = new BattleService(db);

    app.use(express.static(path.join(__dirname, 'webapp')));
    const apiRoutes = require('./routes/api')(db);
app.use('/api', apiRoutes);
app.get('/game', (req, res) => {
   res.sendFile(path.join(__dirname, 'webapp', 'game.html'));
 });
    // Инициализация бота
    const botOptions = process.env.NODE_ENV === 'production' 
      ? { webHook: true }
      : { polling: true };

    const bot = new GameBot(process.env.BOT_TOKEN, botOptions, {
      models: db,
      userService,
      heroService,
      battleService
    });

    // Настройка вебхука в production
    if (process.env.NODE_ENV === 'production') {
      const webhookUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/${process.env.BOT_TOKEN}`;
      await bot.setWebhook(webhookUrl);
      console.log(`✅ Webhook set to: ${webhookUrl}`);
    }

    // Запуск HTTP сервера
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log('🤖 Hero Wars Bot is ready!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Обработка необработанных исключений
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Запуск приложения
startServer();
