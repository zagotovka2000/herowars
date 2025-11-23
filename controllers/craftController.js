// controllers/craftController.js
const { Op } = require('sequelize');

class CraftController {
  constructor(models) {
    this.models = models;
  }

  // Получить рецепт для предмета
  getRecipe = async (req, res) => {
    try {
      const { itemId } = req.params;
      
      const item = await this.models.Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Предмет не найден' });
      }

      // В вашей текущей структуре рецепты хранятся в JSON поле или отдельной таблице
      // Предположим, что у нас есть поле craftRequirements в модели Item
      const recipe = {
        item: item,
        requirements: item.craftRequirements || [],
        cost: item.craftCost || { gold: 0, energy: 0 }
      };

      res.json(recipe);
    } catch (error) {
      console.error('Error getting recipe:', error);
      res.status(500).json({ error: 'Ошибка при получении рецепта' });
    }
  };

  // Проверить возможность крафта
  checkRecipe = async (req, res) => {
    try {
      const { itemId, userId } = req.body;

      const item = await this.models.Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Предмет не найден' });
      }

      // Получаем инвентарь пользователя
      const userInventory = await this.models.Inventory.findAll({
        where: { userId },
        include: [{
          model: this.models.Item,
          attributes: ['id', 'name', 'color']
        }]
      });

      // Проверяем требования крафта
      const craftRequirements = item.craftRequirements || [];
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
      const user = await this.models.User.findByPk(userId);
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
  craftItem = async (req, res) => {
    const transaction = await this.models.sequelize.transaction();
    
    try {
      const { itemId, userId } = req.body;

      const item = await this.models.Item.findByPk(itemId, { transaction });
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Предмет не найден' });
      }

      const user = await this.models.User.findByPk(userId, { transaction });
      const craftRequirements = item.craftRequirements || [];
      const craftCost = item.craftCost || { gold: 0, energy: 0 };

      // Проверяем материалы
      for (const requirement of craftRequirements) {
        const inventoryItem = await this.models.Inventory.findOne({
          where: { userId, itemId: requirement.itemId },
          transaction
        });

        if (!inventoryItem || inventoryItem.quantity < requirement.quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            error: `Недостаточно материалов: ${requirement.itemName}` 
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
      const existingItem = await this.models.Inventory.findOne({
        where: { userId, itemId },
        transaction
      });

      if (existingItem) {
        await existingItem.increment('quantity', { by: 1, transaction });
      } else {
        await this.models.Inventory.create({
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
  getCraftTree = async (req, res) => {
    try {
      const { itemId } = req.params;

      const buildTree = async (currentItemId, depth = 0, maxDepth = 3) => {
        if (depth >= maxDepth) return null;

        const item = await this.models.Item.findByPk(currentItemId);
        if (!item) return null;

        const tree = {
          item: {
            id: item.id,
            name: item.name,
            color: item.color,
            imageUrl: item.imageUrl,
            craftRequirements: item.craftRequirements || []
          },
          children: []
        };

        const requirements = item.craftRequirements || [];
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
  getAvailableRecipes = async (req, res) => {
    try {
      const { userId } = req.query;

      // Получаем все крафтовые предметы
      const craftableItems = await this.models.Item.findAll({
        where: {
          craftRequirements: {
            [Op.ne]: null
          }
        }
      });

      // Получаем инвентарь пользователя
      const userInventory = await this.models.Inventory.findAll({
        where: { userId },
        include: [{
          model: this.models.Item,
          attributes: ['id', 'name']
        }]
      });

      const availableRecipes = [];

      for (const item of craftableItems) {
        const canCraft = await this.checkCraftability(item, userInventory);
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
  getUserMaterials = async (req, res) => {
    try {
      const { userId } = req.query;

      const userMaterials = await this.models.Inventory.findAll({
        where: { userId },
        include: [{
          model: this.models.Item,
          attributes: ['id', 'name', 'color', 'imageUrl', 'type'],
          where: {
            type: ['material', 'consumable']
          }
        }],
        order: [[{ model: this.models.Item, as: 'Item' }, 'color', 'ASC']]
      });

      res.json(userMaterials);

    } catch (error) {
      console.error('Error getting user materials:', error);
      res.status(500).json({ error: 'Ошибка при получении материалов' });
    }
  };

  // Вспомогательная функция для проверки возможности крафта
  checkCraftability = async (item, userInventory) => {
    const requirements = item.craftRequirements || [];
    
    for (const req of requirements) {
      const inventoryItem = userInventory.find(inv => inv.itemId === req.itemId);
      if (!inventoryItem || inventoryItem.quantity < req.quantity) {
        return false;
      }
    }
    
    return true;
  };
}

module.exports = CraftController;
