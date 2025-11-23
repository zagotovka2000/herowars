const { Inventory, Item, User } = require('../db/models');
const { Op } = require('sequelize');

/**
 * Получить инвентарь пользователя
 */
const getUserInventory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🎒 Запрос инвентаря пользователя:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const inventory = await Inventory.findAll({
      where: { userId },
      include: [{
        model: Item
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Найдено ${inventory.length} предметов в инвентаре пользователя ${userId}`);
    res.json(inventory);

  } catch (error) {
    console.error('❌ Ошибка получения инвентаря:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Добавить предмет в инвентарь (для тестирования)
 */
const addItemToInventory = async (req, res) => {
  const transaction = await Inventory.sequelize.transaction();
  
  try {
    const { userId, itemId, quantity = 1 } = req.body;
    
    if (!userId || !itemId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'User ID and Item ID are required' });
    }

    // Проверяем, есть ли уже такой предмет у пользователя
    const existingItem = await Inventory.findOne({
      where: { userId, itemId },
      transaction
    });

    const item = await Item.findByPk(itemId, { transaction });
    
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Item not found' });
    }

    let result;

    if (existingItem) {
      // Проверяем максимальный стак
      if (existingItem.quantity + quantity <= item.maxStack) {
        await existingItem.increment('quantity', { by: quantity, transaction });
        console.log(`📦 Увеличено количество предмета ${item.name} до ${existingItem.quantity + quantity}`);
        result = { action: 'incremented', item: item, newQuantity: existingItem.quantity + quantity };
      } else {
        console.warn(`⚠️ Достигнут максимальный стак для предмета: ${item.name} (${item.maxStack})`);
        // Обрезаем до максимума
        existingItem.quantity = item.maxStack;
        await existingItem.save({ transaction });
        result = { action: 'capped', item: item, newQuantity: item.maxStack };
      }
    } else {
      await Inventory.create({
        userId,
        itemId,
        quantity
      }, { transaction });
      console.log(`🎁 Добавлен новый предмет в инвентарь: ${item.name}`);
      result = { action: 'created', item: item, newQuantity: quantity };
    }

    await transaction.commit();
    res.json({ success: true, ...result });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Ошибка добавления предмета в инвентарь:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить случайный серый предмет
 */
const getRandomGrayItem = async () => {
  try {
    const grayItems = await Item.findAll({
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
};

module.exports = {
  getUserInventory,
  addItemToInventory,
  getRandomGrayItem,
};
