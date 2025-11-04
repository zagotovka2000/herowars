const express = require('express');
const router = express.Router();
const {
  getDailyRewardStatus,
  claimDailyReward
} = require('../controllers/dailyRewardController');

router.get('/user/:userId', getDailyRewardStatus);
router.post('/claim', claimDailyReward);

module.exports = router;
