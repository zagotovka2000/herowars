const { Item, User, Inventory } = require('../db/models');
const { Op } = require('sequelize');

/**
 * Получить товары магазина
 */
const getShopItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { availableFrom: { [Op.lte]: new Date() } },
          { availableFrom: null }
        ]
      },
      order: [['requiredRank', 'ASC'], ['price', 'ASC']]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Купить предмет
 */
const purchaseItem = async (req, res) => {
  try {
    const { userId, itemId, quantity = 1 } = req.body;

    const user = await User.findByPk(userId);
    const item = await Item.findByPk(itemId);

    if (!user || !item) {
      return res.status(404).json({ error: 'Пользователь или предмет не найден' });
    }

    // Проверка уровня/ранга
    if (user.level < item.requiredLevel) {
      return res.status(400).json({ error: 'Недостаточный уровень' });
    }

    const totalCost = item.price * quantity;

    // Проверка валюты и баланса
    if (item.currency === 'gold' && user.gold < totalCost) {
      return res.status(400).json({ error: 'Недостаточно золота' });
    } else if (item.currency === 'gems' && user.gems < totalCost) {
      return res.status(400).json({ error: 'Недостаточно кристаллов' });
    }

    // Списание валюты
    if (item.currency === 'gold') {
      await user.decrement('gold', { by: totalCost });
    } else if (item.currency === 'gems') {
      await user.decrement('gems', { by: totalCost });
    }

    // Добавление предмета в инвентарь
    const [inventoryItem, created] = await Inventory.findOrCreate({
      where: { userId, itemId },
      defaults: { quantity }
    });

    if (!created) {
      await inventoryItem.increment('quantity', { by: quantity });
    }

    // Обновляем пользователя
    await user.reload();

    res.json({
      success: true,
      item: item,
      quantity: quantity,
      totalCost: totalCost,
      newBalance: item.currency === 'gold' ? user.gold : user.gems,
      inventory: await Inventory.findOne({ where: { userId, itemId } })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить специальные предложения
 */
const getSpecialOffers = async (req, res) => {
  try {
    const specialOffers = [
      {
        id: 'starter_pack',
        name: 'Набор новичка',
        description: '5 карт + 1000 золота',
        originalPrice: 199,
        discountPrice: 99,
        currency: 'gems',
        items: [
          { type: 'cards', quantity: 5, rarity: 'common' },
          { type: 'gold', quantity: 1000 }
        ],
        badge: 'ХИТ'
      },
      {
        id: 'energy_pack',
        name: 'Энергетический запас',
        description: '+100 энергии сразу',
        originalPrice: 149,
        discountPrice: 74,
        currency: 'gems',
        items: [
          { type: 'energy', quantity: 100 }
        ],
        badge: '-50%'
      }
    ];

    res.json(specialOffers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getShopItems,
  purchaseItem,
  getSpecialOffers
};
