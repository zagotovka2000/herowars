require('dotenv').config();
const app = require('./app');
const db = require('./db/models');

const PORT = process.env.PORT || 3000;

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
    bot = new GameBot(process.env.BOT_TOKEN, { 
      polling: true 
    }, services);
    console.log('🤖 Telegram Bot initialized');
  } catch (error) {
    console.error('❌ Bot init failed:', error.message);
  }
}

// API Routes
const apiRoutes = require('./routes/api')(db);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    bot: !!bot,
    environment: process.env.NODE_ENV 
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hero Wars Bot API',
    health: '/health',
    api: '/api'
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🏥 Health: http://0.0.0.0:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error);
    process.exit(1);
  }
};

startServer();
