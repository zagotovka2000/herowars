// routes/game.js
const express = require('express');
const router = express.Router();
const { User, Card, Campaign, Quest } = require('./db/models');

// Получить данные пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [Card, Quest]
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Начать кампанию
router.post('/campaign/start', async (req, res) => {
  try {
    const { userId, campaignId } = req.body;
    
    const user = await User.findByPk(userId);
    const campaign = await Campaign.findByPk(campaignId);
    
    if (user.energy < campaign.energyCost) {
      return res.status(400).json({ error: 'Недостаточно энергии' });
    }
    
    // Логика прохождения кампании
    await user.decrement('energy', { by: campaign.energyCost });
    await user.increment('gold', { by: campaign.goldReward });
    await user.increment('experience', { by: campaign.expReward });
    
    // Шанс выпадения предметов
    if (Math.random() < campaign.itemDropChance) {
      // Добавляем предмет в инвентарь
    }
    
    res.json({
      success: true,
      rewards: {
        gold: campaign.goldReward,
        exp: campaign.expReward,
        items: [] // полученные предметы
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Начать экспедицию
router.post('/expedition/start', async (req, res) => {
  try {
    const { userId, cardIds, duration } = req.body;
    
    const expedition = await Expedition.create({
      userId,
      cardIds,
      duration,
      completionTime: new Date(Date.now() + duration * 60000), // duration в минутах
      rewards: calculateExpeditionRewards(cardIds, duration)
    });
    
    res.json(expedition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
