// routes/botRoutes.js
const express = require('express');
const router = express.Router();
const {
  getArenaBots,
  getBotDetails,
  startBotBattle,
  getRandomBot
} = require('../controllers/botController');

// Получить топ-50 ботов для арены
router.get('/arena/bots', getArenaBots);

// Получить детали бота
router.get('/arena/bots/:botId', getBotDetails);

// Начать битву с ботом
router.post('/arena/bots/:botId/battle', startBotBattle);

// Получить случайного бота для быстрой битвы
router.get('/arena/random-bot', getRandomBot);

module.exports = router;
