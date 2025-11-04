// routes/farmingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getFarmingLocations,
  startFarmingSession,
  completeFarmingSession,
  getUserFarmingSessions,
  speedUpFarmingSession
} = require('../controllers/farmingController'); // ← убедитесь что путь правильный

// Фарминг
router.get('/locations', getFarmingLocations);
router.post('/session/start', startFarmingSession);
router.post('/session/:sessionId/complete', completeFarmingSession);
router.post('/session/:sessionId/speed-up', speedUpFarmingSession);
router.get('/user/:userId/sessions', getUserFarmingSessions);

module.exports = router;
