const db = require('./db/models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Синхронизируем базу (в продакшене лучше миграции)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    console.log('🎉 Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
