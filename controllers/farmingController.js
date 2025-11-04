const { FarmingLocation, FarmingSession, User, Inventory, Item } = require('../db/models');

/**
 * Получить доступные локации для фарминга
 * Логика: Фильтрация по уровню пользователя, проверка требований
 */
const getFarmingLocations = async (req, res) => {
  try {
    // TODO: Получить FarmingLocation с requiredLevel <= уровня пользователя
    // Включить информацию о cooldown и itemPool
    // Рассчитать доступность на основе прошлых сессий
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Начать сессию фарминга
 * Логика: Проверка энергии, cooldown, создание FarmingSession
 */
const startFarmingSession = async (req, res) => {
  try {
    // TODO: Проверить энергию пользователя >= energyCost локации
    // Проверить cooldown (последняя completedAt сессия + cooldown)
    // Создать FarmingSession со startedAt
    // Вычесть энергию у пользователя
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Завершить сессию фарминга
 * Логика: Генерация наград, обновление инвентаря, завершение сессии
 */
const completeFarmingSession = async (req, res) => {
  try {
    // TODO: Найти FarmingSession по sessionId
    // Сгенерировать награды на основе itemPool, min/max RewardTier
    // Добавить награды в инвентарь пользователя
    // Обновить FarmingSession completedAt и rewards
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить историю сессий фарминга пользователя
 * Логика: Получение FarmingSession с информацией о локациях и наградах
 */
const getUserFarmingSessions = async (req, res) => {
  try {
    // TODO: Получить FarmingSession с включенными FarmingLocation
    // Фильтровать по userId
    // Сортировка по completedAt (последние сначала)
    // Пагинация
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Ускорить сессию фарминга
 * Логика: Проверка кристаллов, немедленное завершение сессии
 */
const speedUpFarmingSession = async (req, res) => {
  try {
    // TODO: Проверить наличие кристаллов у пользователя
    // Рассчитать стоимость ускорения на основе оставшегося времени
    // Немедленно завершить сессию и выдать награды
    // Списать кристаллы
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFarmingLocations,
  startFarmingSession,
  completeFarmingSession,
  getUserFarmingSessions,
  speedUpFarmingSession
};
