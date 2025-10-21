const express = require('express');
const router = express.Router();

module.exports = function(models, services) {
  
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
        // Перезагружаем пользователя с героями
        await user.reload({ include: [models.Hero] });
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
      const { heroId, userId, telegramId } = req.body;
      
      if (!heroId || !userId) {
        return res.status(400).json({ error: 'Hero ID и User ID обязательны' });
      }
      
      const result = await services.heroService.upgradeHero(heroId, userId);
      
      res.json({ 
        success: true, 
        message: 'Герой улучшен',
        hero: result.hero,
        upgradeCost: result.upgradeCost
      });
    } catch (error) {
      console.error('API upgrade-hero error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Поиск битвы
  router.post('/find-battle', async (req, res) => {
    try {
      const { userId, telegramId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID обязателен' });
      }
      
      const user = await services.userService.findById(userId);
      const activeTeam = await models.Team.findOne({
        where: { userId: user.id, isActive: true },
        include: [{ model: models.Hero }]
      });

      if (!activeTeam || activeTeam.Heroes.length !== 5) {
        return res.status(400).json({ error: 'У вас нет активной команды из 5 героев' });
      }

      // Поиск противника
      const opponent = await services.userService.findRandomOpponent(user.id);
      const opponentTeam = await models.Team.findOne({
        where: { userId: opponent.id, isActive: true },
        include: [{ model: models.Hero }]
      });

      if (!opponentTeam || opponentTeam.Heroes.length !== 5) {
        return res.status(404).json({ error: 'Не удалось найти подходящего противника' });
      }

      // Симуляция битвы
      const battleResult = await services.battleService.simulateBattle(activeTeam, opponentTeam);
      
      // Сохраняем результат битвы
      const battle = await models.Battle.create({
        player1Id: user.id,
        player2Id: opponent.id,
        winnerId: battleResult.winner === 'team1' ? user.id : 
                  battleResult.winner === 'team2' ? opponent.id : null,
        battleLog: battleResult.log,
        status: 'completed'
      });

      // Награды
      if (battleResult.winner === 'team1') {
        await services.userService.updateUserResources(user.id, {
          gold: 100,
          experience: 50
        });
      } else if (battleResult.winner === 'team2') {
        await services.userService.updateUserResources(user.id, {
          gold: 20,
          experience: 20
        });
      }

      res.json({
        success: true,
        winner: battleResult.winner,
        log: battleResult.log,
        battleId: battle.id
      });
      
    } catch (error) {
      console.error('API find-battle error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Получение статистики
  router.get('/stats/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const stats = await services.userService.getUserStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error('API stats error:', error);
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
    },
    {
      name: 'Начальный маг',
      level: 1,
      health: 70,
      attack: 25,
      defense: 3,
      speed: 6,
      criticalChance: 0.12,
      criticalDamage: 2.2,
      heroClass: 'mage',
      rarity: 'common',
      userId: userId
    }
  ];
  
  await models.Hero.bulkCreate(starterHeroes);
}
