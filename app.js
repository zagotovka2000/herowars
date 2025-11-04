const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/battles', require('./routes/battleRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/guilds', require('./routes/guildRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/farming', require('./routes/farmingRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/daily-rewards', require('./routes/daylyRewardRoutes'));
app.use('/api/expeditions', require('./routes/expeditionRoutes'));
app.use('/api/free-chest', require('./routes/freeChestRoutes'));

// Базовая проверка работы
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
   res.json({ 
     message: 'HeroWars Bot API',
     version: '1.0.0',
     endpoints: {
       health: '/health',
       game: '/api/game',
       getUser: '/api/game/user/:userId',
       startCampaign: '/api/game/campaign/start',
       startExpedition: '/api/game/expedition/start'
     }
   });
 });
module.exports = app;
