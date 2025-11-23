// routes/craftRoutes.js
const express = require('express');
const router = express.Router();
const CraftController = require('../controllers/craftController');

// Инициализация контроллера (модели передаются через зависимости)
module.exports = (models) => {
  const craftController = new CraftController(models);

  // Маршруты крафта
  router.get('/recipe/:itemId', craftController.getRecipe);
  router.post('/check', craftController.checkRecipe);
  router.post('/execute', craftController.craftItem);
  router.get('/tree/:itemId', craftController.getCraftTree);
  router.get('/available', craftController.getAvailableRecipes);
  router.get('/materials', craftController.getUserMaterials);

  return router;
};
