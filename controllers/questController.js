const { Quest, QuestProgress, User, Inventory, Item } = require('../db/models');

/**
 * Получить доступные квесты для пользователя
 */
const getAvailableQuests = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const quests = await Quest.findAll({
      where: { 
        isActive: true,
        requiredLevel: { [Op.lte]: user.level }
      },
      include: [{
        model: QuestProgress,
        where: { userId },
        required: false
      }]
    });

    // Фильтруем уже завершенные квесты
    const availableQuests = quests.filter(quest => {
      const progress = quest.QuestProgresses?.[0];
      return !progress || !progress.completed;
    });

    res.json(availableQuests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить прогресс квестов пользователя
 */
const getUserQuestProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = await QuestProgress.findAll({
      where: { userId },
      include: [Quest]
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Обновить прогресс квеста
 */
const updateQuestProgress = async (req, res) => {
  try {
    const { questId } = req.params;
    const { userId, progress: newProgress } = req.body;

    const [questProgress, created] = await QuestProgress.findOrCreate({
      where: { userId, questId },
      defaults: { progress: newProgress, completed: false }
    });

    if (!created) {
      questProgress.progress = newProgress;
      
      const quest = await Quest.findByPk(questId);
      if (questProgress.progress >= quest.objective.target) {
        questProgress.completed = true;
        questProgress.completedAt = new Date();
      }
      
      await questProgress.save();
    }

    res.json(questProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Обновить ежедневные квесты
 * Логика: Сброс прогресса daily квестов в начале дня
 */
const refreshDailyQuests = async (req, res) => {
   try {
     // TODO: Проверить dailyQuestsRefresh пользователя
     // Сбросить прогресс всех daily квестов
     // Обновить dailyQuestsRefresh на текущее время
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 
/**
 * Получить награду за квест
 */
const claimQuestReward = async (req, res) => {
  try {
    const { questId } = req.params;
    const { userId } = req.body;

    const questProgress = await QuestProgress.findOne({
      where: { userId, questId, completed: true, claimed: false },
      include: [Quest]
    });

    if (!questProgress) {
      return res.status(400).json({ error: 'Награда недоступна' });
    }

    // Выдача наград
    const user = await User.findByPk(userId);
    const rewards = questProgress.Quest.reward;

    if (rewards.gold) await user.increment('gold', { by: rewards.gold });
    if (rewards.exp) await user.increment('experience', { by: rewards.exp });
    
    // Выдача предметов
    if (rewards.items && rewards.items.length > 0) {
      for (const itemReward of rewards.items) {
        await Inventory.create({
          userId,
          itemId: itemReward.itemId,
          quantity: itemReward.quantity
        });
      }
    }

    questProgress.claimed = true;
    await questProgress.save();

    res.json({
      success: true,
      rewards: rewards
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAvailableQuests,
  getUserQuestProgress,
  updateQuestProgress,
  claimQuestReward,
  refreshDailyQuests
};
