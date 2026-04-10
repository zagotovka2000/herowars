const express = require('express');
const router = express.Router();
const strongholdController = require('../11controllers/strongholdController');

router.get('/defenses', strongholdController.getGlobalDefenses);
router.put('/defenses', strongholdController.saveGlobalDefenses);

module.exports = router;
