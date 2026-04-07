const { Item, Inventory, User, CraftRecipe, sequelize } = require('../db/models');
const { Op } = require('sequelize');

// Получить рецепт для предмета
const getRecipe = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Предмет не найден' });
    }

    // Если используем отдельную таблицу рецептов
    const recipeItems = await CraftRecipe.findAll({
      where: { resultItemId: itemId },
      include: [{
        model: Item,
        attributes: ['id', 'name', 'color', 'imageUrl', 'description']
      }],
      order: [['order', 'ASC']]
    });

    const recipe = {
      item: item,
      requirements: recipeItems.length > 0 ? recipeItems : item.craftRequirements || [],
      cost: item.craftCost || { gold: 0, energy: 0 }
    };

    res.json(recipe);
  } catch (error) {
    console.error('Error getting recipe:', error);
    res.status(500).json({ error: 'Ошибка при получении рецепта' });
  }
};

// Проверить возможность крафта
const checkRecipe = async (req, res) => {
  try {
    const { itemId, userId } = req.body;

    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Предмет не найден' });
    }

    // Получаем инвентарь пользователя
    const userInventory = await Inventory.findAll({
      where: { userId },
      include: [{
        model: Item,
        attributes: ['id', 'name', 'color']
      }]
    });

    // Получаем требования крафта из таблицы рецептов или из поля предмета
    let craftRequirements = [];
    const recipeItems = await CraftRecipe.findAll({
      where: { resultItemId: itemId }
    });

    if (recipeItems.length > 0) {
      craftRequirements = recipeItems.map(recipe => ({
        itemId: recipe.materialItemId,
        quantity: recipe.quantity,
        itemName: recipe.Item ? recipe.Item.name : 'Неизвестный предмет'
      }));
    } else {
      craftRequirements = item.craftRequirements || [];
    }

    const missingMaterials = [];
    let canCraft = true;

    for (const requirement of craftRequirements) {
      const inventoryItem = userInventory.find(inv => inv.itemId === requirement.itemId);
      const availableQuantity = inventoryItem ? inventoryItem.quantity : 0;
      
      if (availableQuantity < requirement.quantity) {
        canCraft = false;
        missingMaterials.push({
          itemId: requirement.itemId,
          required: requirement.quantity,
          available: availableQuantity,
          itemName: requirement.itemName
        });
      }
    }

    // Проверяем ресурсы пользователя
    const user = await User.findByPk(userId);
    const craftCost = item.craftCost || { gold: 0, energy: 0 };

    if (user.gold < craftCost.gold) {
      canCraft = false;
      missingMaterials.push({
        resource: 'gold',
        required: craftCost.gold,
        available: user.gold
      });
    }

    if (user.energy < craftCost.energy) {
      canCraft = false;
      missingMaterials.push({
        resource: 'energy',
        required: craftCost.energy,
        available: user.energy
      });
    }

    res.json({
      canCraft,
      missingMaterials,
      requirements: craftRequirements,
      cost: craftCost
    });

  } catch (error) {
    console.error('Error checking recipe:', error);
    res.status(500).json({ error: 'Ошибка при проверке рецепта' });
  }
};

// Выполнить крафт предмета
const craftItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { itemId, userId } = req.body;

    const item = await Item.findByPk(itemId, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Предмет не найден' });
    }

    const user = await User.findByPk(userId, { transaction });
    
    // Получаем требования крафта
    let craftRequirements = [];
    const recipeItems = await CraftRecipe.findAll({
      where: { resultItemId: itemId },
      transaction
    });

    if (recipeItems.length > 0) {
      craftRequirements = recipeItems.map(recipe => ({
        itemId: recipe.materialItemId,
        quantity: recipe.quantity
      }));
    } else {
      craftRequirements = item.craftRequirements || [];
    }

    const craftCost = item.craftCost || { gold: 0, energy: 0 };

    // Проверяем материалы
    for (const requirement of craftRequirements) {
      const inventoryItem = await Inventory.findOne({
        where: { userId, itemId: requirement.itemId },
        transaction
      });

      if (!inventoryItem || inventoryItem.quantity < requirement.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Недостаточно материалов` 
        });
      }

      // Списываем материалы
      await inventoryItem.decrement('quantity', { 
        by: requirement.quantity,
        transaction 
      });

      // Если количество стало 0, удаляем запись
      if (inventoryItem.quantity === 0) {
        await inventoryItem.destroy({ transaction });
      }
    }

    // Проверяем и списываем ресурсы
    if (user.gold < craftCost.gold) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Недостаточно золота' });
    }

    if (user.energy < craftCost.energy) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Недостаточно энергии' });
    }

    await user.decrement('gold', { by: craftCost.gold, transaction });
    await user.decrement('energy', { by: craftCost.energy, transaction });

    // Добавляем созданный предмет в инвентарь
    const existingItem = await Inventory.findOne({
      where: { userId, itemId },
      transaction
    });

    if (existingItem) {
      // Проверяем максимальный стак
      const itemData = await Item.findByPk(itemId, { transaction });
      if (existingItem.quantity < itemData.maxStack) {
        await existingItem.increment('quantity', { by: 1, transaction });
      } else {
        await transaction.rollback();
        return res.status(400).json({ error: 'Достигнут максимальный стак предмета' });
      }
    } else {
      await Inventory.create({
        userId,
        itemId,
        quantity: 1
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `Предмет "${item.name}" успешно создан!`,
      item: {
        id: item.id,
        name: item.name,
        color: item.color,
        imageUrl: item.imageUrl
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error crafting item:', error);
    res.status(500).json({ error: 'Ошибка при создании предмета' });
  }
};

// Получить дерево крафта
const getCraftTree = async (req, res) => {
  try {
    const { itemId } = req.params;

    const buildTree = async (currentItemId, depth = 0, maxDepth = 3) => {
      if (depth >= maxDepth) return null;

      const item = await Item.findByPk(currentItemId);
      if (!item) return null;

      // Получаем рецепт для текущего предмета
      let requirements = [];
      const recipeItems = await CraftRecipe.findAll({
        where: { resultItemId: currentItemId },
        include: [{
          model: Item,
          attributes: ['id', 'name', 'color', 'imageUrl']
        }]
      });

      if (recipeItems.length > 0) {
        requirements = recipeItems.map(recipe => ({
          itemId: recipe.materialItemId,
          quantity: recipe.quantity,
          item: recipe.Item
        }));
      } else {
        requirements = item.craftRequirements || [];
      }

      const tree = {
        item: {
          id: item.id,
          name: item.name,
          color: item.color,
          imageUrl: item.imageUrl,
          craftRequirements: requirements
        },
        children: []
      };

      for (const req of requirements) {
        const childTree = await buildTree(req.itemId, depth + 1, maxDepth);
        if (childTree) {
          tree.children.push({
            ...childTree,
            requiredQuantity: req.quantity
          });
        }
      }

      return tree;
    };

    const craftTree = await buildTree(itemId);
    res.json(craftTree);

  } catch (error) {
    console.error('Error getting craft tree:', error);
    res.status(500).json({ error: 'Ошибка при получении дерева крафта' });
  }
};

// Получить доступные рецепты для пользователя
const getAvailableRecipes = async (req, res) => {
  try {
    const { userId } = req.query;

    // Получаем все крафтовые предметы
    const craftableItems = await Item.findAll({
      where: {
        [Op.or]: [
          { isCraftable: true },
          { craftRequirements: { [Op.ne]: null } }
        ]
      }
    });

    // Получаем инвентарь пользователя
    const userInventory = await Inventory.findAll({
      where: { userId },
      include: [{
        model: Item,
        attributes: ['id', 'name']
      }]
    });

    const availableRecipes = [];

    for (const item of craftableItems) {
      const canCraft = await checkCraftability(item, userInventory);
      if (canCraft) {
        availableRecipes.push(item);
      }
    }

    res.json(availableRecipes);

  } catch (error) {
    console.error('Error getting available recipes:', error);
    res.status(500).json({ error: 'Ошибка при получении рецептов' });
  }
};

// Получить материалы пользователя
const getUserMaterials = async (req, res) => {
  try {
    const { userId } = req.query;

    const userMaterials = await Inventory.findAll({
      where: { userId },
      include: [{
        model: Item,
        attributes: ['id', 'name', 'color', 'imageUrl', 'type'],
        where: {
          type: ['material', 'consumable']
        }
      }],
      order: [[Item, 'color', 'ASC']]
    });

    res.json(userMaterials);

  } catch (error) {
    console.error('Error getting user materials:', error);
    res.status(500).json({ error: 'Ошибка при получении материалов' });
  }
};

// Вспомогательная функция для проверки возможности крафта
const checkCraftability = async (item, userInventory) => {
  let requirements = [];
  
  // Получаем рецепт из таблицы или из поля предмета
  const recipeItems = await CraftRecipe.findAll({
    where: { resultItemId: item.id }
  });

  if (recipeItems.length > 0) {
    requirements = recipeItems.map(recipe => ({
      itemId: recipe.materialItemId,
      quantity: recipe.quantity
    }));
  } else {
    requirements = item.craftRequirements || [];
  }
  
  for (const req of requirements) {
    const inventoryItem = userInventory.find(inv => inv.itemId === req.itemId);
    if (!inventoryItem || inventoryItem.quantity < req.quantity) {
      return false;
    }
  }
  
  return true;
};

module.exports = {
  getRecipe,
  checkRecipe,
  craftItem,
  getCraftTree,
  getAvailableRecipes,
  getUserMaterials
};
