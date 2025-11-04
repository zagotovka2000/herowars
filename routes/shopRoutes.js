const express = require('express');
const router = express.Router();
const {
  getShopItems,
  purchaseItem,
  getSpecialOffers
} = require('../controllers/shopController');

router.get('/items', getShopItems);
router.post('/purchase', purchaseItem);
router.get('/special-offers', getSpecialOffers);

module.exports = router;
