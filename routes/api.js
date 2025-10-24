const express = require('express');
const router = express.Router();

module.exports = function(models) {
  // Game data endpoint - расширен для Web App
  router.post('/game-data', async (req, res) => {
    try {
      const { telegramId } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ error: 'telegramId is required' });
      }
      
      const user = await models.User.findOne({ 
        where: { telegramId },
        include: [
          { 
            model: models.Hero,
            order: [['level', 'DESC']]
          },
          { 
            model: models.Team, 
            where: { isActive: true },
            required: false,
            include: [{ 
              model: models.Hero,
              through: { attributes: ['position'] }
            }] 
          }
        ]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Получаем статистику битв
      const battlesCount = await models.Battle.count({
        where: {
          [models.Sequelize.Op.or]: [
            { player1Id: user.id },
            { player2Id: user.id }
          ]
        }
      });

      const winsCount = await models.Battle.count({
        where: { winnerId: user.id }
      });

      // Форматируем данные для Web App
      const teamHeroes = user.Teams && user.Teams[0] ? 
        user.Teams[0].Heroes.sort((a, b) => a.TeamHero.position - b.TeamHero.position) : 
        [];
      
      res.json({
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          level: user.level,
          gold: user.gold,
          gems: user.gems,
          experience: user.experience,
          nextLevelExp: user.level * 100
        },
        heroes: user.Heroes.map(hero => ({
          id: hero.id,
          name: hero.name,
          level: hero.level,
          health: hero.health,
          attack: hero.attack,
          defense: hero.defense,
          speed: hero.speed,
          criticalChance: hero.criticalChance,
          criticalDamage: hero.criticalDamage,
          heroClass: hero.heroClass,
          rarity: hero.rarity,
          upgradeCost: hero.level * 100,
          inTeam: teamHeroes.some(th => th.id === hero.id)
        })),
        team: user.Teams && user.Teams[0] ? {
          id: user.Teams[0].id,
          name: user.Teams[0].name,
          heroes: teamHeroes.map(hero => ({
            id: hero.id,
            name: hero.name,
            level: hero.level,
            health: hero.health,
            attack: hero.attack,
            defense: hero.defense,
            speed: hero.speed,
            heroClass: hero.heroClass,
            position: hero.TeamHero.position
          }))
        } : null,
        stats: {
          battlesCount,
          winsCount,
          winRate: battlesCount > 0 ? (winsCount / battlesCount * 100).toFixed(1) : 0
        }
      });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Upgrade hero endpoint
  router.post('/upgrade-hero', async (req, res) => {
    try {
      const { heroId, userId } = req.body;
      
      if (!heroId || !userId) {
        return res.status(400).json({ error: 'heroId and userId are required' });
      }

      // Получаем героя и пользователя
      const hero = await models.Hero.findOne({ 
        where: { id: heroId, userId } 
      });
      
      if (!hero) {
        return res.status(404).json({ error: 'Hero not found' });
      }

      const user = await models.User.findByPk(userId);
      const upgradeCost = hero.level * 100;

      // Проверяем достаточно ли золота
      if (user.gold < upgradeCost) {
        return res.status(400).json({ 
          error: `Недостаточно золота. Нужно: ${upgradeCost}, у вас: ${user.gold}` 
        });
      }

      // Вычисляем улучшения
      const healthIncrease = Math.floor(hero.health * 0.1);
      const attackIncrease = Math.floor(hero.attack * 0.1);
      const defenseIncrease = Math.floor(hero.defense * 0.1);
      const speedIncrease = Math.floor(hero.speed * 0.05);

      // Обновляем героя
      await hero.update({
        level: hero.level + 1,
        health: hero.health + healthIncrease,
        attack: hero.attack + attackIncrease,
        defense: hero.defense + defenseIncrease,
        speed: hero.speed + speedIncrease,
        criticalChance: Math.min(hero.criticalChance + 0.01, 0.5),
        criticalDamage: Math.min(hero.criticalDamage + 0.05, 3.0)
      });

      // Списание золота
      await user.update({
        gold: user.gold - upgradeCost
      });

      res.json({
        success: true,
        hero: {
          id: hero.id,
          name: hero.name,
          level: hero.level,
          health: hero.health,
          attack: hero.attack,
          defense: hero.defense,
          speed: hero.speed,
          criticalChance: hero.criticalChance,
          criticalDamage: hero.criticalDamage,
          upgradeCost: hero.level * 100
        },
        increases: {
          health: healthIncrease,
          attack: attackIncrease,
          defense: defenseIncrease,
          speed: speedIncrease
        },
        goldSpent: upgradeCost,
        newGold: user.gold - upgradeCost
      });
      
    } catch (error) {
      console.error('Upgrade hero error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update team composition
  router.post('/update-team', async (req, res) => {
    try {
      const { userId, heroIds } = req.body;
      
      if (!userId || !heroIds || !Array.isArray(heroIds) || heroIds.length !== 5) {
        return res.status(400).json({ 
          error: 'userId and heroIds (array of 5 hero IDs) are required' 
        });
      }

      // Находим активную команду пользователя
      let team = await models.Team.findOne({
        where: { userId, isActive: true }
      });

      if (!team) {
        // Создаем новую команду если нет активной
        team = await models.Team.create({
          name: 'Моя команда',
          isActive: true,
          userId: userId
        });
      }

      // Удаляем старый состав команды
      await models.TeamHero.destroy({
        where: { teamId: team.id }
      });

      // Добавляем новых героев в команду
      for (let i = 0; i < heroIds.length; i++) {
        const heroId = heroIds[i];
        
        // Проверяем, что герой принадлежит пользователю
        const hero = await models.Hero.findOne({
          where: { id: heroId, userId }
        });

        if (!hero) {
          return res.status(400).json({ 
            error: `Герой с ID ${heroId} не принадлежит пользователю` 
          });
        }

        await models.TeamHero.create({
          teamId: team.id,
          heroId: heroId,
          position: i + 1
        });
      }

      // Получаем обновленную команду с героями
      const updatedTeam = await models.Team.findOne({
        where: { id: team.id },
        include: [{ 
          model: models.Hero,
          through: { attributes: ['position'] }
        }]
      });

      res.json({
        success: true,
        team: {
          id: updatedTeam.id,
          name: updatedTeam.name,
          heroes: updatedTeam.Heroes.sort((a, b) => a.TeamHero.position - b.TeamHero.position).map(hero => ({
            id: hero.id,
            name: hero.name,
            level: hero.level,
            health: hero.health,
            attack: hero.attack,
            defense: hero.defense,
            speed: hero.speed,
            heroClass: hero.heroClass,
            position: hero.TeamHero.position
          }))
        }
      });
      
    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Start battle endpoint
  router.post('/start-battle', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Здесь будет логика начала битвы
      // Пока возвращаем заглушку
      res.json({ 
        success: true, 
        message: 'Battle started - implement battle logic here',
        battleId: Math.random().toString(36).substr(2, 9)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
