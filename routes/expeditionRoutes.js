const express = require('express');
const router = express.Router();
const {
  getUserExpeditions,
  startExpedition,
  completeExpedition
} = require('../controllers/expeditionController');

router.get('/user/:userId', getUserExpeditions);
router.post('/start', startExpedition);
router.post('/:expeditionId/complete', completeExpedition);

module.exports = router;
