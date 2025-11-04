// routes/questRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAvailableQuests,
  getUserQuestProgress,
  updateQuestProgress,
  claimQuestReward,
  refreshDailyQuests
} = require('../controllers/questController'); // ← убедитесь что путь правильный

// Квесты
router.get('/available', getAvailableQuests);
router.get('/user/:userId/progress', getUserQuestProgress);
router.post('/:questId/progress', updateQuestProgress);
router.post('/:questId/claim', claimQuestReward);
router.post('/refresh-daily', refreshDailyQuests);

module.exports = router;
