const { User, Card, Inventory,Quest, QuestProgress, DailyReward } = require('../db/models');

/**
 * Получить профиль пользователя
 */
const getUserProfile = async (req, res) => {
  try {
    const { telegramId, userId } = req.params;
    console.log('🔍 Поиск пользователя по:', { telegramId, userId });
    
    let user;
    
    // Поддерживаем оба типа идентификаторов
    if (telegramId) {
      user = await User.findOne({
        where: { telegramId: String(telegramId) }
      });
    } else if (userId) {
      user = await User.findByPk(userId);
    }

    console.log('📊 Результат поиска:', user ? 'Найден' : 'Не найден');
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Форматируем ответ для фронтенда
    const userData = {
      id: user.id,
      username: user.username || user.gameNik,
      gameNik: user.gameNik,
      level: user.level || 1,
      experience: user.experience || 0,
      energy: user.energy || 100,
      maxEnergy: user.maxEnergy || 100,
      gold: user.gold || 0,
      gems: user.crystals || 0,
      guild: null,
      cards: [],
      lastEnergyUpdate: user.lastEnergyUpdate,
      campaignProgress: user.campaignProgress || {},
      arenaRating: user.arenaRating || 0
    };

    res.json(userData);
  } catch (error) {
    console.error('❌ Ошибка получения профиля:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Обновить профиль пользователя
 */
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Разрешенные поля для обновления
    const allowedUpdates = ['gameNik', 'energy', 'gold', 'crystals', 'experience', 'level', 'campaignProgress'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await user.update(filteredUpdates);
    res.json({ success: true, user: filteredUpdates });
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить карты пользователя
 */
const getUserCards = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cards = await Card.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(cards);
  } catch (error) {
    console.error('❌ Ошибка получения карт:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить инвентарь пользователя
 */
const getUserInventory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const inventory = await Inventory.findAll({
      where: { userId },
      include: [{
        model: Item
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(inventory);
  } catch (error) {
    console.error('❌ Ошибка получения инвентаря:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить квесты пользователя
 */
const getUserQuests = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const quests = await QuestProgress.findAll({
      where: { userId },
      include: [{
        model: Quest
      }]
    });

    res.json(quests);
  } catch (error) {
    console.error('❌ Ошибка получения квестов:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить ежедневную награду
 */
const claimDailyReward = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Здесь будет логика выдачи ежедневной награды
    res.json({ success: true, message: 'Ежедневная награда получена' });
  } catch (error) {
    console.error('❌ Ошибка получения награды:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Открыть бесплатный сундук
 */
const openFreeChest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Здесь будет логика открытия сундука
    res.json({ success: true, message: 'Сундук открыт' });
  } catch (error) {
    console.error('❌ Ошибка открытия сундука:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserCards,
  getUserInventory,
  getUserQuests,
  claimDailyReward,
  openFreeChest
};
