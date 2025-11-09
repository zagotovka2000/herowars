const { User, Card, Inventory, QuestProgress, DailyReward } = require('../db/models');

/**
 * Получить профиль пользователя
 * Логика: Получение основных данных пользователя, статистики, прогресса
 */
const getUserProfile = async (req, res) => {
   try {
      const { telegramId } = req.params;
      console.log('🔍 Поиск пользователя по telegramId:', telegramId);
      
      // ✅ ПРАВИЛЬНЫЙ ПОИСК: по telegramId (BIGINT)
      const user = await User.findOne({
         where: { telegramId }  });
  
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
        gems: user.crystals || 0, // crystals -> gems для фронтенда
        guild: null,
        cards: user.Cards || [],
        lastEnergyUpdate: user.lastEnergyUpdate,
        campaignProgress: user.campaignProgress || {},
        arenaRating: user.arenaRating || 0
      };
  
      res.json(userData);
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Обновить профиль пользователя
 * Логика: Обновление ника, настроек, аватара
 */
const updateUserProfile = async (req, res) => {
   try {
      const { userId } = req.params;
      console.log('======update user======updateUserProfile', user)
      const updates = req.body;
  
      const user = await User.findByPk(userId);
      const users = await User.findAll();
      console.log('======users', users);
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
    }catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить карты пользователя
 * Логика: Получение всех карт пользователя с фильтрацией и пагинацией
 */
const getUserCards = async (req, res) => {
  try {
    // TODO: Получить карты с возможностью фильтрации по isInDeck, цвету, рангу
    // Включить информацию о экипированных предметах
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить инвентарь пользователя
 * Логика: Получение всех предметов в инвентаре с группировкой по типам
 */
const getUserInventory = async (req, res) => {
  try {
    // TODO: Получить Inventory с включенными Item
    // Сгруппировать по типу предметов
    // Рассчитать общее количество каждого предмета
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить квесты пользователя
 * Логика: Получение активных квестов и прогресса по ним
 */
const getUserQuests = async (req, res) => {
  try {
    // TODO: Получить QuestProgress с включенными Quest
    // Фильтровать по активным квестам
    // Рассчитать оставшееся время для ежедневных/еженедельных квестов
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить ежедневную награду
 * Логика: Проверка доступности награды, обновление стрика, выдача наград
 */
const claimDailyReward = async (req, res) => {
  try {
    // TODO: Проверить nextAvailableAt
    // Определить тип награды на основе стрика
    // Выдать награду (валюту/карты/предметы)
    // Обновить стрик и nextAvailableAt
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Открыть бесплатный сундук
 * Логика: Проверка доступности, генерация случайных наград, обновление времени
 */
const openFreeChest = async (req, res) => {
  try {
    // TODO: Проверить freeChestAvailableAt
    // Сгенерировать случайные награды на основе ранга игрока
    // Выдать награды и обновить freeChestAvailableAt
  } catch (error) {
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
