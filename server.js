const app = require('./app');
const db = require('../server/db/models');
const CityBuilderBot = require('./bot/bot');
const QueueService = require('./bot/services/queueService');
const webhookRoutes = require('./routes/webhook');
const apiRoutes = require('./routes/index');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting City Builder Bot Server...');

    // Проверка подключения к базе данных
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // Синхронизация базы данных (в development)
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ force: false });
      console.log('✅ Database synchronized');
    }

    // Инициализация бота
    const botOptions = process.env.NODE_ENV === 'production' 
      ? { webHook: true }
      : { polling: true };

    const bot = new CityBuilderBot(process.env.BOT_TOKEN, botOptions);

    // Настройка вебхука в production
    if (process.env.NODE_ENV === 'production') {
      const webhookUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/${process.env.BOT_TOKEN}`;
      await bot.setWebhook(webhookUrl, process.env.WEBHOOK_SECRET);
      console.log(`✅ Webhook set to: ${webhookUrl}`);
    }


    // Запуск HTTP сервера
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log('🤖 City Builder Bot is ready!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
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
