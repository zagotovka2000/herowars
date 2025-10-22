const db = require('./db/models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔌 Database URL:', process.env.DATABASE_URL ? 'set' : 'not set');
    
    // Проверяем подключение
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Выводим информацию о БД
    const config = db.sequelize.config;
    console.log(`📊 Database: ${config.database}, Host: ${config.host}`);
    
    // Синхронизируем базу
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    console.log('🎉 Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

migrate();
