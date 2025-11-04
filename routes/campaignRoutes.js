const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getCampaignLevels,
  startCampaignLevel,
  getCampaignProgress,
  claimCampaignReward,
  //getCampaignLevels claimCampaignReward
} = require('../controllers/campaignController');

// Кампании и уровни
router.get('/', getCampaigns);
router.get('/:campaignId/levels', getCampaignLevels);

// Прохождение кампании
router.post('/level/start', startCampaignLevel);
router.get('/:userId/progress', getCampaignProgress);
router.post('/level/:levelId/claim', claimCampaignReward);
//getCampaignLevels claimCampaignReward
module.exports = router;
