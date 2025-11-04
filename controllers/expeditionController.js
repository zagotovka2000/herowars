const { Expedition, User, Inventory, Item, FarmingLocation } = require('../db/models');

/**
 * Получить экспедиции пользователя
 */
const getUserExpeditions = async (req, res) => {
  try {
    const { userId } = req.params;

    const expeditions = await Expedition.findAll({
      where: { userId },
      include: [FarmingLocation],
      order: [['startedAt', 'DESC']]
    });

    res.json(expeditions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Начать экспедицию
 */
const startExpedition = async (req, res) => {
  try {
    const { userId, locationId, cardIds, duration } = req.body;

    const user = await User.findByPk(userId);
    const location = await FarmingLocation.findByPk(locationId);

    if (!user || !location) {
      return res.status(404).json({ error: 'Пользователь или локация не найдены' });
    }

    // Проверка энергии
    if (user.energy < location.energyCost) {
      return res.status(400).json({ error: 'Недостаточно энергии' });
    }

    // Проверка уровня
    if (user.level < location.requiredLevel) {
      return res.status(400).json({ error: 'Недостаточный уровень' });
    }

    // Создаем экспедицию
    const expedition = await Expedition.create({
      userId,
      locationId,
      energySpent: location.energyCost,
      rewards: calculateExpeditionRewards(location, cardIds, duration),
      startedAt: new Date(),
      completionTime: new Date(Date.now() + duration * 60000) // duration в минутах
    });

    // Снимаем энергию
    await user.decrement('energy', { by: location.energyCost });

    res.json(expedition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Завершить экспедицию
 */
const completeExpedition = async (req, res) => {
  try {
    const { expeditionId } = req.params;

    const expedition = await Expedition.findByPk(expeditionId, {
      include: [FarmingLocation, User]
    });

    if (!expedition) {
      return res.status(404).json({ error: 'Экспедиция не найдена' });
    }

    if (expedition.completedAt) {
      return res.status(400).json({ error: 'Экспедиция уже завершена' });
    }

    if (new Date() < expedition.completionTime) {
      return res.status(400).json({ error: 'Экспедиция еще не завершена' });
    }

    // Выдаем награды
    const user = expedition.User;
    const rewards = expedition.rewards;

    if (rewards.gold) await user.increment('gold', { by: rewards.gold });
    if (rewards.exp) await user.increment('experience', { by: rewards.exp });

    // Выдаем предметы
    if (rewards.items && rewards.items.length > 0) {
      for (const itemReward of rewards.items) {
        const item = await Item.findByPk(itemReward.itemId);
        if (item) {
          await Inventory.create({
            userId: user.id,
            itemId: item.id,
            quantity: itemReward.quantity || 1
          });
        }
      }
    }

    // Обновляем экспедицию
    expedition.completedAt = new Date();
    await expedition.save();

    // Обновляем пользователя
    await user.reload();

    res.json({
      success: true,
      expedition: expedition,
      rewards: rewards,
      user: {
        gold: user.gold,
        experience: user.experience,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Рассчитать награды за экспедицию
 */
const calculateExpeditionRewards = (location, cardIds, duration) => {
  const baseGold = location.minRewardTier * duration / 60;
  const baseExp = location.maxRewardTier * duration / 60;

  // Случайные бонусы
  const goldBonus = Math.random() * 0.5 + 0.75; // 75-125%
  const expBonus = Math.random() * 0.5 + 0.75;

  const rewards = {
    gold: Math.floor(baseGold * goldBonus),
    exp: Math.floor(baseExp * expBonus),
    items: []
  };

  // Шанс выпадения предметов
  if (location.itemPool && Math.random() < 0.3) {
    const randomItem = location.itemPool[Math.floor(Math.random() * location.itemPool.length)];
    rewards.items.push({
      itemId: randomItem.itemId,
      quantity: randomItem.quantity || 1
    });
  }

  return rewards;
};

module.exports = {
  getUserExpeditions,
  startExpedition,
  completeExpedition
};
