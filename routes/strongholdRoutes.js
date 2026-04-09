const express = require('express');
const router = express.Router();
const {
  getGlobalDefenses,
  saveGlobalDefenses,
} = require('../controllers/strongholdController');

router.get('/defenses', getGlobalDefenses);
router.put('/defenses', saveGlobalDefenses);

module.exports = router;
