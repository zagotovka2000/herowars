const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserCards,
  getUserInventory,
  getUserQuests,
  claimDailyReward,
  openFreeChest
} = require('../controllers/userController');

// Профиль пользователя
router.get('/telegram/:telegramId', getUserProfile); 
router.get('/:userId/profile', getUserProfile); 
router.put('/:userId', updateUserProfile);

// Карты пользователя
router.get('/:userId/cards', getUserCards);

// Инвентарь
router.get('/:userId/inventory', getUserInventory);

// Квесты
router.get('/:userId/quests', getUserQuests);

// Награды
router.post('/:userId/daily-reward', claimDailyReward);
router.post('/:userId/free-chest', openFreeChest);

module.exports = router;
