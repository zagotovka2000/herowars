const { User, Item, Inventory, Card, ChestProgress } = require('../db/models');
const { Op } = require('sequelize');

// Конфигурация сундуков (можно вынести в отдельный config)
const CHEST_CONFIG = {
  gray: {
    name: 'Ежедневный сундук',
    description: 'Открывается каждые 24 часа',
    icon: '📦',
    color: '#95a5a6',
    cooldownHours: 24,
    rewardType: 'item'
  },
  green: {
    name: 'Редкий сундук',
    description: 'Открывается каждые 72 часа', 
    icon: '🎁',
    color: '#2ecc71',
    cooldownHours: 72,
    rewardType: 'card'
  },
  blue: {
    name: 'Эпический сундук',
    description: 'Открывается раз в неделю',
    icon: '💎',
    color: '#3498db',
    cooldownHours: 168, // 7 дней
    rewardType: 'premium_card'
  }
};

/**
 * Получить статус всех сундуков пользователя
 */
const getChestStatus = async (req, res) => {
  try {
    const { telegramId } = req.params;

    const user = await User.findOne({ where: { telegramId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Получаем или создаем прогресс по сундукам
    const chestProgress = await ChestProgress.findOrCreateAll(user.id);
    
    const now = new Date();
    const chests = {};

    // Формируем ответ для каждого типа сундука
    for (const [chestType, config] of Object.entries(CHEST_CONFIG)) {
      const progress = chestProgress.find(cp => cp.chestType === chestType);
      
      chests[chestType] = {
        type: chestType,
        canOpen: !progress.nextAvailableAt || new Date(progress.nextAvailableAt) <= now,
        nextAvailableAt: progress.nextAvailableAt,
        lastOpenedAt: progress.lastOpenedAt,
        openCount: progress.openCount,
        streak: progress.streak,
        ...config
      };
    }

    res.json({
      success: true,
      chests,
      userResources: {
        gold: user.gold,
        crystals: user.crystals,
        energy: user.energy
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения статуса сундуков:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Открыть сундук
 */
const openChest = async (req, res) => {
  try {
    const { telegramId, chestType } = req.body;

    const user = await User.findOne({ where: { telegramId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем валидность типа сундука
    if (!CHEST_CONFIG[chestType]) {
      return res.status(400).json({ error: 'Неверный тип сундука' });
    }

    const now = new Date();
    
    // Находим прогресс по сундуку
    const [chestProgress, created] = await ChestProgress.findOrCreate({
      where: { 
        userId: user.id, 
        chestType 
      },
      defaults: {
        lastOpenedAt: null,
        nextAvailableAt: null,
        openCount: 0,
        streak: 0
      }
    });

    // Проверяем можно ли открыть сундук
    if (chestProgress.nextAvailableAt && new Date(chestProgress.nextAvailableAt) > now) {
      return res.status(400).json({ 
        error: 'Сундук еще не доступен для открытия' 
      });
    }

    // Генерируем награду
    const reward = await generateChestReward(user, chestType);
    
    // Рассчитываем следующее время открытия
    const cooldownMs = CHEST_CONFIG[chestType].cooldownHours * 60 * 60 * 1000;
    const nextAvailableAt = new Date(now.getTime() + cooldownMs);

    // Обновляем прогресс
    const wasRecent = chestProgress.lastOpenedAt && 
      (now - new Date(chestProgress.lastOpenedAt)) < (24 * 60 * 60 * 1000);
    
    await chestProgress.update({
      lastOpenedAt: now,
      nextAvailableAt,
      openCount: chestProgress.openCount + 1,
      streak: wasRecent ? chestProgress.streak + 1 : 1
    });

    // Выдаем награды пользователю
    await grantRewards(user, reward);

    // Обновляем пользователя
    await user.reload();

    res.json({
      success: true,
      chestType,
      reward,
      nextAvailableAt,
      streak: chestProgress.streak,
      userResources: {
        gold: user.gold,
        crystals: user.crystals,
        energy: user.energy,
        level: user.level
      }
    });

  } catch (error) {
    console.error('❌ Ошибка открытия сундука:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Генерация наград для сундука
 */
const generateChestReward = async (user, chestType) => {
  const baseRewards = {
    gray: {
      gold: () => 50 + Math.floor(user.level * 2 + Math.random() * 25),
      crystals: () => Math.random() < 0.3 ? 5 : 0,
      energy: 10,
      items: async () => {
        const grayItems = await Item.findAll({ where: { color: 'gray' }, limit: 10 });
        const randomItem = grayItems[Math.floor(Math.random() * grayItems.length)];
        return randomItem ? [{ 
          itemId: randomItem.id, 
          quantity: 1,
          name: randomItem.name,
          icon: '⚫'
        }] : [];
      }
    },
    green: {
      gold: () => 150 + Math.floor(user.level * 5 + Math.random() * 50),
      crystals: () => 10 + Math.floor(user.level * 0.5),
      energy: 25,
      cards: () => [{
        name: `Зеленая карта ${Date.now()}`,
        color: 'green',
        attack: 15 + Math.floor(Math.random() * 10),
        health: 60 + Math.floor(Math.random() * 20),
        icon: '🟢'
      }]
    },
    blue: {
      gold: () => 300 + Math.floor(user.level * 10 + Math.random() * 100),
      crystals: () => 25 + Math.floor(user.level * 1),
      energy: 50,
      cards: () => [{
        name: `Синяя карта ${Date.now()}`,
        color: 'blue',
        attack: 25 + Math.floor(Math.random() * 15),
        health: 80 + Math.floor(Math.random() * 30),
        icon: '🔵'
      }]
    }
  };

  const config = baseRewards[chestType];
  const reward = {
    gold: config.gold ? await config.gold() : 0,
    crystals: config.crystals ? await config.crystals() : 0,
    energy: config.energy || 0,
    items: config.items ? await config.items() : [],
    cards: config.cards ? await config.cards() : [],
    message: `Вы открыли ${CHEST_CONFIG[chestType].name}!`
  };

  return reward;
};

/**
 * Выдача наград пользователю
 */
const grantRewards = async (user, reward) => {
  // Выдаем валюту
  if (reward.gold) await user.increment('gold', { by: reward.gold });
  if (reward.crystals) await user.increment('crystals', { by: reward.crystals });
  if (reward.energy) await user.increment('energy', { by: reward.energy });

  // Выдаем предметы
  for (const itemReward of reward.items) {
    const [inventoryItem] = await Inventory.findOrCreate({
      where: { 
        userId: user.id, 
        itemId: itemReward.itemId 
      },
      defaults: { quantity: 0 }
    });
    
    await inventoryItem.increment('quantity', { by: itemReward.quantity || 1 });
  }

  // Создаем карты
  for (const cardReward of reward.cards) {
    await Card.create({
      userId: user.id,
      name: cardReward.name,
      color: cardReward.color,
      rank: 1,
      baseAttack: cardReward.attack,
      baseHealth: cardReward.health,
      baseArmor: 0,
      baseCriticalChance: 0.05,
      currentHealth: cardReward.health,
      superMeter: 0,
      superAttackMultiplier: 1.5,
      level: 1,
      experience: 0,
      isInDeck: false,
      slotPosition: null,
      equippedItems: [],
      maxHealth: cardReward.health,
      currentSuperMeter: 0,
      baseSuperMultiplier: 1.5,
      abilities: [],
      battleStats: { battles: 0, wins: 0, superAttacks: 0 }
    });
  }
};

module.exports = {
  getChestStatus,
  openChest
};
