const { Inventory, Item, User } = require('../db/models');
// services/inventoryService.js
class InventoryService {
   constructor(models) {
     this.models = models;
   }
 
   // Добавить предмет в инвентарь
   async addItemToInventory(userId, itemId, quantity = 1) {
      const transaction = await this.models.sequelize.transaction();
      
      try {
        // Проверяем, есть ли уже такой предмет у пользователя
        const existingItem = await this.models.Inventory.findOne({
          where: { userId, itemId },
          transaction
        });
  
        const item = await this.models.Item.findByPk(itemId, { transaction });
        
        if (!item) {
          throw new Error('Предмет не найден');
        }
  
        if (existingItem) {
          // Проверяем максимальный стак
          if (existingItem.quantity + quantity <= item.maxStack) {
            await existingItem.increment('quantity', { by: quantity, transaction });
            console.log(`📦 Увеличено количество предмета ${item.name} до ${existingItem.quantity + quantity}`);
          } else {
            console.warn(`⚠️ Достигнут максимальный стак для предмета: ${item.name} (${item.maxStack})`);
            // Обрезаем до максимума
            existingItem.quantity = item.maxStack;
            await existingItem.save({ transaction });
          }
        } else {
          await this.models.Inventory.create({
            userId,
            itemId,
            quantity
          }, { transaction });
          console.log(`🎁 Добавлен новый предмет в инвентарь: ${item.name}`);
        }
  
        await transaction.commit();
        return { success: true, item };
  
      } catch (error) {
        await transaction.rollback();
        console.error('❌ Ошибка добавления предмета в инвентарь:', error);
        throw error;
      }
    }
 
   // Получить инвентарь пользователя
   async getUserInventory(userId) {
      try {
        console.log('🎒 Запрос инвентаря пользователя:', userId);
  
        const inventory = await this.models.Inventory.findAll({
          where: { userId },
          include: [{
            model: this.models.Item,
            attributes: ['id', 'name', 'color', 'imageUrl', 'description', 'type', 'maxStack']
          }],
          order: [['createdAt', 'DESC']]
        });
  
        console.log(`✅ Найдено ${inventory.length} предметов в инвентаре пользователя ${userId}`);
        return inventory;
  
      } catch (error) {
        console.error('❌ Ошибка получения инвентаря:', error);
        throw error;
      }
    }
 
   // Получить случайный серый предмет
   async getRandomGrayItem() {
      try {
        const grayItems = await this.models.Item.findAll({
          where: { 
            color: 'gray',
            type: 'material'
          }
        });
  
        if (grayItems.length === 0) {
          console.warn('⚠️ Серые предметы не найдены в базе данных');
          return null;
        }
  
        // Случайный выбор из серых предметов
        const randomIndex = Math.floor(Math.random() * grayItems.length);
        const randomItem = grayItems[randomIndex];
        
        console.log(`🎲 Выпал случайный предмет: ${randomItem.name}`);
        return randomItem;
      } catch (error) {
        console.error('❌ Ошибка получения случайного предмета:', error);
        return null;
      }
    }
  
 
   // Выдать случайный предмет после боя
   async grantRandomItemAfterBattle(userId) {
     try {
       const randomItem = await this.getRandomGrayItem();
       const result = await this.addItemToInventory(userId, randomItem.id, 1);
       
       return {
         success: true,
         item: randomItem,
         message: `Получен предмет: ${randomItem.name}`
       };
     } catch (error) {
       console.error('Ошибка выдачи предмета после боя:', error);
       throw error;
     }
   }
 }
 
 module.exports = InventoryService;
