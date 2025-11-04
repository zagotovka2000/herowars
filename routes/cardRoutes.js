const express = require('express');
const router = express.Router();
const {
  getUserCards,
  upgradeCard,
  equipCard,
  unequipCard,
  useCardItem,
  fuseCards
} = require('../controllers/cardController');

// Карты
router.get('/user/:userId', getUserCards);
router.post('/:cardId/upgrade', upgradeCard);
router.post('/:cardId/equip', equipCard);
router.post('/:cardId/unequip', unequipCard);
router.post('/:cardId/use-item', useCardItem);
router.post('/fuse', fuseCards);

module.exports = router;
