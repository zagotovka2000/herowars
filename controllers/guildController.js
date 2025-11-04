const { Guild, User, GuildMember, Battle } = require('../db/models');

/**
 * Создать гильдию
 * Логика: Проверка требований (уровень, трофеи), создание гильдии, назначение лидера
 */
const createGuild = async (req, res) => {
  try {
    // TODO: Проверить что пользователь соответствует требованиям (уровень, трофеи)
    // Проверить что имя гильдии и тег уникальны
    // Создать гильдию с leaderId = userId создателя
    // Создать запись в GuildMember с ролью 'leader'
    // Обновить guildId у пользователя
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить информацию о гильдии
 * Логика: Получение основной информации, статистики, ранжирования
 */
const getGuildInfo = async (req, res) => {
  try {
    // TODO: Получить гильдию с включенными данными лидера
    // Рассчитать общую статистику гильдии (сумма трофеев участников, средний уровень)
    // Получить текущий ранг гильдии в общем зачете
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Вступить в гильдию
 * Логика: Проверка требований гильдии, проверка свободных мест, создание GuildMember
 */
const joinGuild = async (req, res) => {
  try {
    // TODO: Проверить requiredTrophy гильдии
    // Проверить membersCount < maxMembers
    // Проверить isOpen гильдии
    // Создать GuildMember с ролью 'recruit'
    // Обновить guildId пользователя
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Покинуть гильдию
 * Логика: Проверка что не лидер, удаление GuildMember, обновление статистики
 */
const leaveGuild = async (req, res) => {
  try {
    // TODO: Проверить что пользователь не лидер гильдии
    // Удалить запись из GuildMember
    // Обновить membersCount гильдии
    // Обнулить guildId пользователя
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Обновить роль участника гильдии
 * Логика: Проверка прав текущего пользователя, обновление роли участника
 */
const updateGuildMember = async (req, res) => {
  try {
    // TODO: Проверить что текущий пользователь - лидер или officer
    // Проверить что нельзя изменить роль лидера
    // Обновить роль участника
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить список участников гильдии
 * Логика: Получение всех участников с информацией и сортировкой по вкладу/роли
 */
const getGuildMembers = async (req, res) => {
  try {
    // TODO: Получить всех GuildMember с включенными User
    // Отсортировать по роли (leader -> officer -> member -> recruit)
    // Включить статистику участников (вклад, последнее пожертвование)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Пожертвовать гильдии
 * Логика: Проверка ресурсов, обновление вклада, увеличение опыта гильдии
 */
const donateToGuild = async (req, res) => {
  try {
    // TODO: Проверить наличие золота/кристаллов у пользователя
    // Обновить contribution участника
    // Увеличить experience гильдии
    // Обновить lastDonation
    // Проверить не превышает ли donation лимиты
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить историю битв гильдии
 * Логика: Получение последних битв гильдии с пагинацией
 */
const getGuildBattles = async (req, res) => {
  try {
    // TODO: Получить Battle где guild1Id или guild2Id = guildId
    // Включить информацию о противниках
    // Пагинация и фильтрация по статусу/типу
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Обновить настройки гильдии
 * Логика: Проверка прав, обновление описания, требований, настроек
 */
const updateGuildSettings = async (req, res) => {
  try {
    // TODO: Проверить что пользователь - лидер или officer
    // Обновить разрешенные поля (description, requiredTrophy, isOpen)
    // Валидация данных
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Распустить гильдию
 * Логика: Проверка что пользователь лидер, удаление гильдии, обновление участников
 */
const disbandGuild = async (req, res) => {
  try {
    // TODO: Проверить что пользователь - лидер гильдии
    // Удалить все GuildMember записи
    // Обнулить guildId у всех участников
    // Удалить гильдию
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGuild,
  getGuildInfo,
  joinGuild,
  leaveGuild,
  updateGuildMember,
  getGuildMembers,
  donateToGuild,
  getGuildBattles,
  updateGuildSettings,
  disbandGuild
};
