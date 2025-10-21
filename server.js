require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./app');
const db = require('./db/models');
const GameBot = require('./bot/bot');
const BattleService = require('./bot/services/battleService');
const HeroService = require('./bot/services/heroService');
const UserService = require('./bot/services/userService');

// Инициализация сервисов
const services = {
  models: db,
  userService: new UserService(db),
  heroService: new HeroService(db),
  battleService: new BattleService(db)
};

// Middleware
app.use(express.json());

// CORS для фронтенда на Vercel
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://your-frontend-app.vercel.app',
    'https://herowars-umber.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API маршруты
const apiRoutes = require('./routes/api')(db, services);
app.use('/api', apiRoutes);

// Health check для Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Hero Wars Backend'
  });
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hero Wars Backend API',
    endpoints: {
      health: '/health',
      api: '/api',
      webapp: 'https://your-frontend-app.vercel.app/game'
    }
  });
});

// Запуск бота (только если есть BOT_TOKEN)
let bot;
if (process.env.BOT_TOKEN) {
  bot = new GameBot(process.env.BOT_TOKEN, { polling: true }, services);
  console.log('🤖 Telegram Bot started with polling');
  
  // Обновляем Web App URL в боте
  bot.setWebAppUrl(process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app/game');
} else {
  console.log('⚠️ BOT_TOKEN not found - running in API mode only');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Web App Frontend: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
