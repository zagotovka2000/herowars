const express = require('express');
const router = express.Router();

module.exports = function(models) {
  // Game data endpoint
  router.post('/game-data', async (req, res) => {
    try {
      const { telegramId } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ error: 'telegramId is required' });
      }
      
      const user = await models.User.findOne({ 
        where: { telegramId },
        include: [
          { model: models.Hero },
          { 
            model: models.Team, 
            where: { isActive: true },
            required: false,
            include: [{ model: models.Hero }] 
          }
        ]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        user: {
          id: user.id,
          level: user.level,
          gold: user.gold,
          gems: user.gems,
          experience: user.experience
        },
        heroes: user.Heroes || [],
        team: user.Teams && user.Teams[0] ? user.Teams[0] : null
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
      
      // Здесь будет логика улучшения героя
      // Пока заглушка
      res.json({ 
        success: true, 
        message: 'Hero upgrade endpoint - implement this' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
