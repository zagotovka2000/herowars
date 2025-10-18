const express = require('express');
const router = express.Router();

module.exports = function(models) {
  router.post('/game-data', async (req, res) => {
    try {
      const { telegramId } = req.body;
      
      const user = await models.User.findOne({ 
        where: { telegramId },
        include: [
          { model: models.Hero },
          { model: models.Team, include: [models.Hero] }
        ]
      });
      
      res.json({
        user: {
          id: user.id,
          level: user.level,
          gold: user.gold,
          gems: user.gems
        },
        heroes: user.Heroes,
        teams: user.Teams
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
