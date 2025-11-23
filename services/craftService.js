// services/craftService.js
class CraftService {
   constructor(models) {
     this.models = models;
   }
 
   // Получить полный рецепт крафта
   async getRecipe(resultItemId) {
     return await this.models.CraftRecipe.findAll({
       where: { resultItemId },
       include: [
         {
           model: this.models.Item,
           attributes: ['id', 'name', 'color', 'imageUrl', 'description']
         }
       ],
       order: [['order', 'ASC']]
     });
   }
 
   // Проверить возможность крафта
   async canCraftItem(userId, resultItemId) {
     const recipe = await this.getRecipe(resultItemId);
     const userInventory = await this.models.Inventory.findAll({
       where: { userId },
       include: [{
         model: this.models.Item,
         attributes: ['id', 'name', 'maxStack']
       }]
     });
 
     const inventoryMap = new Map();
     userInventory.forEach(item => {
       inventoryMap.set(item.itemId, item.quantity);
     });
 
     for (const ingredient of recipe) {
       const available = inventoryMap.get(ingredient.materialItemId) || 0;
       if (available < ingredient.quantity) {
         return {
           canCraft: false,
           missing: {
             itemId: ingredient.materialItemId,
             required: ingredient.quantity,
             available: available
           }
         };
       }
     }
 
     return { canCraft: true, recipe };
   }
 
   // Выполнить крафт
   async craftItem(userId, resultItemId) {
     const { canCraft, recipe, missing } = await this.canCraftItem(userId, resultItemId);
     
     if (!canCraft) {
       throw new Error(`Недостаточно материалов: ${missing.required - missing.available} ${missing.itemId}`);
     }
 
     const resultItem = await this.models.Item.findByPk(resultItemId);
     const user = await this.models.User.findByPk(userId);
 
     // Проверяем ресурсы
     if (user.gold < resultItem.craftCost.gold) {
       throw new Error('Недостаточно золота');
     }
     if (user.crystals < resultItem.craftCost.crystals) {
       throw new Error('Недостаточно кристаллов');
     }
     if (user.energy < resultItem.craftCost.energy) {
       throw new Error('Недостаточно энергии');
     }
 
     const transaction = await this.models.sequelize.transaction();
 
     try {
       // Списываем материалы
       for (const ingredient of recipe) {
         await this.models.Inventory.decrement('quantity', {
           by: ingredient.quantity,
           where: { userId, itemId: ingredient.materialItemId },
           transaction
         });
       }
 
       // Списываем ресурсы
       await user.decrement('gold', { by: resultItem.craftCost.gold, transaction });
       await user.decrement('crystals', { by: resultItem.craftCost.crystals, transaction });
       await user.decrement('energy', { by: resultItem.craftCost.energy, transaction });
 
       // Добавляем результат
       const existingItem = await this.models.Inventory.findOne({
         where: { userId, itemId: resultItemId },
         transaction
       });
 
       if (existingItem && existingItem.quantity < resultItem.maxStack) {
         await existingItem.increment('quantity', { by: 1, transaction });
       } else if (!existingItem) {
         await this.models.Inventory.create({
           userId,
           itemId: resultItemId,
           quantity: 1
         }, { transaction });
       } else {
         throw new Error('Достигнут максимальный стак предмета');
       }
 
       await transaction.commit();
       return { success: true, item: resultItem };
 
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
   }
 
   // Получить дерево крафта для предмета
   async getCraftTree(itemId, depth = 3) {
     if (depth <= 0) return null;
 
     const item = await this.models.Item.findByPk(itemId);
     if (!item.isCraftable) {
       return {
         item: item.toJSON(),
         ingredients: []
       };
     }
 
     const recipe = await this.getRecipe(itemId);
     const ingredients = await Promise.all(
       recipe.map(async ingredient => ({
         ingredient: ingredient.toJSON(),
         tree: await this.getCraftTree(ingredient.materialItemId, depth - 1)
       }))
     );
 
     return {
       item: item.toJSON(),
       ingredients
     };
   }
 }
 
 module.exports = CraftService;
