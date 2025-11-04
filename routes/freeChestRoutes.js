const express = require('express');
const router = express.Router();
const {
  getFreeChestStatus,
  openFreeChest
} = require('../controllers/freeChestController');

router.get('/user/:userId', getFreeChestStatus);
router.post('/open', openFreeChest);

module.exports = router;
