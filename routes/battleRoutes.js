const express = require('express');
const router = express.Router();
const {
  startPvPBattle,
  startGuildBattle,
  startCampaignBattle,
  startTrainingBattle,
  makeBattleMove,
  surrenderBattle,
  getBattleResult
} = require('../controllers/battleController');

// Начать битву
router.post('/pvp/start', startPvPBattle);
router.post('/guild/start', startGuildBattle);
router.post('/campaign/start', startCampaignBattle);
router.post('/training/start', startTrainingBattle);

// Управление битвой
router.post('/:battleId/move', makeBattleMove);
router.post('/:battleId/surrender', surrenderBattle);
router.get('/:battleId/result', getBattleResult);

module.exports = router;
