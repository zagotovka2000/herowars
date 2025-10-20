const express = require('express');
const router = express.Router();

module.exports = function(models) {
  // Получение данных для Web App
  router.post('/game-data', async (req, res) => {
    try {
      const { telegramId, username } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID обязателен' });
      }
      
      // Находим или создаем пользователя
      const [user] = await models.User.findOrCreate({
        where: { telegramId },
        defaults: {
          username: username || 'Игрок',
          level: 1,
          experience: 0,
          gold: 1000,
          gems: 50
        },
        include: [
          { model: models.Hero },
          { 
            model: models.Team, 
            include: [{ model: models.Hero }] 
          }
        ]
      });
      
      // Если пользователь только что создан, создаем стартовых героев
      if (user.Heroes.length === 0) {
        await createStarterHeroes(user.id, models);
      }
      
      res.json({
        user: {
          id: user.id,
          level: user.level,
          gold: user.gold,
          gems: user.gems,
          experience: user.experience
        },
        heroes: user.Heroes,
        teams: user.Teams || []
      });
      
    } catch (error) {
      console.error('API game-data error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Улучшение героя через Web App
  router.post('/upgrade-hero', async (req, res) => {
    try {
      const { heroId, userId } = req.body;
      
      // Здесь реализуйте логику улучшения героя
      // Аналогично той, что в HeroService
      
      res.json({ success: true, message: 'Герой улучшен' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};

// Функция создания стартовых героев
async function createStarterHeroes(userId, models) {
  const starterHeroes = [
    {
      name: 'Начальный воин',
      level: 1,
      health: 100,
      attack: 15,
      defense: 8,
      speed: 5,
      criticalChance: 0.1,
      criticalDamage: 1.5,
      heroClass: 'warrior',
      rarity: 'common',
      userId: userId
    },
    {
      name: 'Начальный лучник',
      level: 1,
      health: 80,
      attack: 20,
      defense: 5,
      speed: 8,
      criticalChance: 0.15,
      criticalDamage: 2.0,
      heroClass: 'archer',
      rarity: 'common',
      userId: userId
    }
  ];
  
  await models.Hero.bulkCreate(starterHeroes);
}
