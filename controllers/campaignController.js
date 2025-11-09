const { Campaign, User, CampaignLevel, CampaignProgress } = require('../db/models');
const { Op } = require('sequelize');

// Получить все кампании с уровнями
const getCampaigns = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('📋 Запрос кампаний для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Проверяем существование пользователя
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Получаем активные кампании с уровнями (БЕЗ АЛИАСОВ)
    const campaigns = await Campaign.findAll({
      where: { 
        isActive: true,
        requiredLevel: { [Op.lte]: user.level }
      },
      include: [{
        model: CampaignLevel,
        order: [['levelNumber', 'ASC']],
        required: false
      }],
      order: [['order', 'ASC']]
    });

    console.log(`✅ Найдено ${campaigns.length} кампаний для пользователя уровня ${user.level}`);
    
    // Преобразуем данные для фронтенда
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      requiredLevel: campaign.requiredLevel,
      imageUrl: campaign.imageUrl,
      // Используем прямое обращение к связанным моделям
      levels: campaign.CampaignLevels ? campaign.CampaignLevels.map(level => ({
        id: level.id,
        campaignId: level.campaignId,
        name: level.name,
        description: level.description,
        levelNumber: level.levelNumber,
        energyCost: level.energyCost,
        goldReward: level.goldReward,
        expReward: level.expReward,
        itemRewards: level.itemRewards,
        enemyDeck: level.enemyDeck,
        requiredPower: level.requiredPower,
        imageUrl: level.imageUrl,
        isBossLevel: level.isBossLevel
      })) : []
    }));

    res.json(formattedCampaigns);

  } catch (error) {
    console.error('❌ Ошибка получения кампаний:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить прогресс пользователя по кампаниям
const getCampaignProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📊 Запрос прогресса кампаний для пользователя:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Проверяем существование пользователя
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Получаем прогресс пользователя (БЕЗ АЛИАСОВ)
    const progress = await CampaignProgress.findAll({
      where: { userId },
      include: [
        {
          model: Campaign
        },
        {
          model: CampaignLevel
        }
      ],
      order: [
        [Campaign, 'order', 'ASC'],
        [CampaignLevel, 'levelNumber', 'ASC']
      ]
    });

    // Группируем прогресс по кампаниям для удобства на фронтенде
    const groupedProgress = {};
    
    progress.forEach(item => {
      const campaignId = item.campaignId;
      
      if (!groupedProgress[campaignId]) {
        groupedProgress[campaignId] = {
          campaign: {
            id: item.Campaign.id,
            name: item.Campaign.name,
            description: item.Campaign.description
          },
          levels: []
        };
      }

      groupedProgress[campaignId].levels.push({
        levelId: item.levelId,
        campaignId: item.campaignId,
        completed: item.completed,
        stars: item.stars,
        bestScore: item.bestScore,
        attempts: item.attempts,
        completedAt: item.completedAt,
        levelInfo: item.CampaignLevel ? {
          levelNumber: item.CampaignLevel.levelNumber,
          name: item.CampaignLevel.name
        } : null
      });
    });

    console.log(`✅ Прогресс загружен для ${Object.keys(groupedProgress).length} кампаний`);
    res.json(groupedProgress);

  } catch (error) {
    console.error('❌ Ошибка получения прогресса кампаний:', error);
    res.status(500).json({ error: error.message });
  }
};

// Начать уровень кампании
const startCampaignLevel = async (req, res) => {
  try {
    const { userId, levelId } = req.body;
    
    console.log('🎯 Начало уровня кампании:', { userId, levelId });

    if (!userId || !levelId) {
      return res.status(400).json({ error: 'User ID and Level ID are required' });
    }

    const user = await User.findByPk(userId);
    const campaignLevel = await CampaignLevel.findByPk(levelId, {
      include: [{
        model: Campaign
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!campaignLevel) {
      return res.status(404).json({ error: 'Campaign level not found' });
    }

    // Проверяем уровень доступа
    if (user.level < campaignLevel.Campaign.requiredLevel) {
      return res.status(400).json({ 
        error: `Необходим уровень ${campaignLevel.Campaign.requiredLevel} для этой кампании` 
      });
    }

    // Проверяем энергию
    if (user.energy < campaignLevel.energyCost) {
      return res.status(400).json({ 
        error: `Недостаточно энергии. Нужно: ${campaignLevel.energyCost}, есть: ${user.energy}` 
      });
    }

    // Списываем энергию
    user.energy -= campaignLevel.energyCost;
    await user.save();

    // Создаем или обновляем прогресс
    const [progress, created] = await CampaignProgress.findOrCreate({
      where: { 
        userId, 
        levelId 
      },
      defaults: { 
        campaignId: campaignLevel.campaignId,
        stars: 0, 
        completed: false, 
        bestScore: 0,
        attempts: 1
      }
    });

    // Если уже существует, увеличиваем счетчик попыток
    if (!created) {
      progress.attempts += 1;
      await progress.save();
    }

    // Генерируем ID битвы
    const battleId = `battle_${Date.now()}_${userId}_${levelId}`;

    res.json({
      success: true,
      battleId: battleId,
      campaignLevel: {
        id: campaignLevel.id,
        name: campaignLevel.name,
        levelNumber: campaignLevel.levelNumber,
        energyCost: campaignLevel.energyCost,
        enemyDeck: campaignLevel.enemyDeck
      },
      progress: {
        completed: progress.completed,
        stars: progress.stars,
        bestScore: progress.bestScore,
        attempts: progress.attempts
      },
      userEnergy: user.energy
    });

  } catch (error) {
    console.error('❌ Ошибка начала уровня кампании:', error);
    res.status(500).json({ error: error.message });
  }
};

// Завершить уровень кампании и получить награду
const claimCampaignReward = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { userId, stars, score, battleId } = req.body;
    
    console.log('🏆 Завершение уровня кампании:', { userId, levelId, stars, score });

    if (!userId || !levelId) {
      return res.status(400).json({ error: 'User ID and Level ID are required' });
    }

    // Находим прогресс (БЕЗ АЛИАСОВ)
    const progress = await CampaignProgress.findOne({
      where: { userId, levelId },
      include: [{
        model: CampaignLevel
      }]
    });

    if (!progress) {
      return res.status(404).json({ error: 'Campaign progress not found' });
    }

    // Обновляем прогресс
    const wasCompleted = progress.completed;
    progress.completed = true;
    
    if (stars > progress.stars) {
      progress.stars = stars;
    }
    
    if (score > progress.bestScore) {
      progress.bestScore = score;
    }
    
    progress.completedAt = new Date();
    await progress.save();

    // Награждаем пользователя только если уровень завершен впервые
    let rewards = { gold: 0, experience: 0 };
    const user = await User.findByPk(userId);
    const campaignLevel = progress.CampaignLevel;
    
    if (!wasCompleted) {
      user.gold += campaignLevel.goldReward;
      user.experience += campaignLevel.expReward;
      rewards = {
        gold: campaignLevel.goldReward,
        experience: campaignLevel.expReward
      };
      
      // Проверяем повышение уровня
      const expForNextLevel = user.level * 100;
      if (user.experience >= expForNextLevel) {
        user.level += 1;
        user.experience -= expForNextLevel;
      }
      
      await user.save();
    }

    res.json({
      success: true,
      progress: {
        completed: progress.completed,
        stars: progress.stars,
        bestScore: progress.bestScore,
        attempts: progress.attempts,
        completedAt: progress.completedAt
      },
      rewards: rewards,
      user: {
        gold: user.gold,
        experience: user.experience,
        level: user.level,
        energy: user.energy
      },
      levelUp: user.experience === 0
    });

  } catch (error) {
    console.error('❌ Ошибка завершения уровня кампании:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получить уровни конкретной кампании
const getCampaignLevels = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log('📂 Запрос уровней для кампании:', campaignId);

    const levels = await CampaignLevel.findAll({
      where: { campaignId },
      order: [['levelNumber', 'ASC']],
      include: [{
        model: Campaign
      }]
    });

    res.json(levels);
  } catch (error) {
    console.error('❌ Ошибка получения уровней кампании:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCampaigns,
  getCampaignLevels,
  startCampaignLevel,
  getCampaignProgress,
  claimCampaignReward
};
