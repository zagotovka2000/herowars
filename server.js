// server.js
require('dotenv').config();
const app = require('./app'); // импортируем приложение из app.js
const db = require('./db/models');

const PORT = process.env.PORT || 3000;

// Функция для запуска сервера
async function startServer() {
  try {
    // Проверяем подключение к базе данных
    await db.sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');

    // Синхронизируем модели с базой данных
    await db.sequelize.sync({    logging: false });
    console.log('✅ Модели базы данных синхронизированы');

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log('🎮 =================================');
      console.log(`🚀 Сервер HeroWarsBot запущен!`);
      console.log(`📍 Порт: ${PORT}`);
      console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Время запуска: ${new Date().toLocaleString()}`);
      console.log('🎮 =================================');
      
      // Дополнительная информация для разработки
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📊 Проверка здоровья: http://localhost:${PORT}/health`);
        console.log(`🎯 Game API: http://localhost:${PORT}/api/game`);
        console.log(`🏠 Главная страница: http://localhost:${PORT}/`);
      }
    });

  } catch (error) {
    console.error('❌ Ошибка запуска сервера:');
    console.error('🔧 Детали ошибки:', error.message);
    process.exit(1);
  }
}

// Обработка graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔻 Получен сигнал SIGINT, завершаем работу...');
  try {
    await db.sequelize.close();
    console.log('✅ Подключение к базе данных закрыто');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при закрытии подключения:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔻 Получен сигнал SIGTERM, завершаем работу...');
  try {
    await db.sequelize.close();
    console.log('✅ Подключение к базе данных закрыто');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при закрытии подключения:', error);
    process.exit(1);
  }
});

// Запускаем сервер
startServer();
