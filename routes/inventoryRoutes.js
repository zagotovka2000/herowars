// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserInventory,
  addItemToInventory,
  removeItemFromInventory
} = require('../controllers/inventoryController');

// Получить инвентарь пользователя
router.get('/user/:userId', getUserInventory);

// Добавить предмет в инвентарь (для тестирования)
router.post('/add', addItemToInventory);


module.exports = router;
