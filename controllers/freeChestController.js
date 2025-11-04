const { User, Inventory, Item } = require('../db/models');

/**
 * Получить статус бесплатного сундука
 */
const getFreeChestStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const now = new Date();
    const lastChest = user.freeChestAvailableAt ? new Date(user.freeChestAvailableAt) : new Date(0);
    const nextAvailable = new Date(lastChest.getTime() + 4 * 60 * 60 * 1000); // 4 часа

    res.json({
      lastOpenedAt: lastChest,
      nextAvailableAt: nextAvailable,
      canOpen: now >= nextAvailable,
      timeUntilAvailable: Math.max(0, nextAvailable - now)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Открыть бесплатный сундук
 */
const openFreeChest = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем возможность открытия
    const chestStatus = await getFreeChestStatus({ params: { userId } });
    if (!chestStatus.canOpen) {
      return res.status(400).json({ error: 'Сундук еще не доступен' });
    }

    // Генерируем награды
    const rewards = generateChestRewards(user.level);

    // Выдаем награды
    if (rewards.gold) await user.increment('gold', { by: rewards.gold });
    if (rewards.exp) await user.increment('experience', { by: rewards.exp });
    if (rewards.gems) await user.increment('gems', { by: rewards.gems });

    // Выдаем предметы
    if (rewards.items && rewards.items.length > 0) {
      for (const itemReward of rewards.items) {
        const item = await Item.findByPk(itemReward.itemId);
        if (item) {
          await Inventory.create({
            userId,
            itemId: item.id,
            quantity: itemReward.quantity || 1
          });
        }
      }
    }

    // Выдаем карты (если есть в наградах)
    if (rewards.cards && rewards.cards.length > 0) {
      // Здесь будет логика создания карт для пользователя
      console.log('Выданы карты:', rewards.cards);
    }

    // Обновляем время следующего сундука
    user.freeChestAvailableAt = new Date();
    await user.save();

    res.json({
      success: true,
      rewards: rewards,
      nextAvailableAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Генерация наград для сундука
 */
const generateChestRewards = (userLevel) => {
  const baseGold = 50 + Math.floor(userLevel * 2.5);
  const baseExp = 25 + Math.floor(userLevel * 1.5);

  const rewards = {
    gold: baseGold + Math.floor(Math.random() * baseGold * 0.5),
    exp: baseExp + Math.floor(Math.random() * baseExp * 0.5),
    gems: Math.random() < 0.3 ? Math.floor(1 + userLevel * 0.1) : 0,
    items: [],
    cards: []
  };

  // Шанс предметов
  if (Math.random() < 0.4) {
    rewards.items.push({
      itemId: 'common_potion',
      quantity: 1 + Math.floor(Math.random() * 2)
    });
  }

  // Шанс карты
  if (Math.random() < 0.25) {
    const rarities = ['common', 'common', 'common', 'rare', 'epic'];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    rewards.cards.push({
      rarity: rarity,
      type: 'character'
    });
  }

  return rewards;
};

module.exports = {
  getFreeChestStatus,
  openFreeChest
};
