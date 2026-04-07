const express = require('express');
const router = express.Router();
const {
  getRecipe,
  checkRecipe,
  craftItem,
  getCraftTree,
  getAvailableRecipes,
  getUserMaterials
} = require('../controllers/craftController');

// Маршруты крафта
router.get('/recipe/:itemId', getRecipe);
router.post('/check', checkRecipe);
router.post('/execute', craftItem);
router.get('/tree/:itemId', getCraftTree);
router.get('/available', getAvailableRecipes);
router.get('/materials', getUserMaterials);

module.exports = router;
