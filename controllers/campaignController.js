const { Campaign, User, CampaignLevel, CampaignProgress, Item, Inventory } = require('../db/models');
const { Op } = require('sequelize');
const { getRandomGrayItem } = require('./inventoryController');

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
        model: CampaignLevel
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
      ]
    });

    // Сортируем вручную вместо order в запросе
    progress.sort((a, b) => {
      if (a.Campaign && b.Campaign) {
        if (a.Campaign.order !== b.Campaign.order) {
          return a.Campaign.order - b.Campaign.order;
        }
      }
      if (a.CampaignLevel && b.CampaignLevel) {
        return a.CampaignLevel.levelNumber - b.CampaignLevel.levelNumber;
      }
      return 0;
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
    console.log(" ============= userId, levelId:", 1111111111111111)
    console.log(" ============= userId, levelId:", userId, levelId)
    
    if (!userId || !levelId) {
       return res.status(400).json({ error: 'User ID and Level ID are required' });
      }
      
      console.log(" ============= userId, levelId:", 22222222222222)
      const user = await User.findByPk(userId);
      console.log(" ============= userId, levelId:", 33333333333333)
    console.log(" ============= user:", user)
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

// Завершить уровень кампании и выдать награды
const claimCampaignReward = async (req, res) => {
   console.log('claimCampaignReward============');
   try {
     const { levelId } = req.params;
     const { userId, stars, score } = req.body;
     
     console.log('🏆 Завершение уровня кампании:', { userId, levelId, stars, score });
 
     if (!userId || !levelId) {
       return res.status(400).json({ error: 'User ID and Level ID are required' });
     }
 
     const transaction = await CampaignProgress.sequelize.transaction();
     console.log(" claimCampaignReward =============transaction:", transaction)
     
     try {
       // Находим прогресс
       const progress = await CampaignProgress.findOne({
         where: { userId, levelId },
         include: [{
           model: CampaignLevel
         }],
         transaction
       });
 
       if (!progress) {
         await transaction.rollback();
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
       await progress.save({ transaction });
 
       // Награждаем пользователя
       let rewards = { gold: 0, experience: 0, items: [] };
       const user = await User.findByPk(userId, { transaction });
       const campaignLevel = progress.CampaignLevel;
       
       if (!wasCompleted) {
         // Базовые награды
         rewards.gold = campaignLevel.goldReward || 0;
         rewards.experience = campaignLevel.expReward || 0;
         
         user.gold += rewards.gold;
         user.experience += rewards.experience;
         
         // Генерируем случайные предметы из itemRewards уровня
         if (campaignLevel.itemRewards && Array.isArray(campaignLevel.itemRewards)) {
           for (const reward of campaignLevel.itemRewards) {
             const roll = Math.random();
             if (roll <= (reward.chance || 0.5)) {
               const item = await Item.findByPk(reward.itemId, { transaction });
               if (item) {
                 rewards.items.push({
                   itemId: reward.itemId,
                   quantity: reward.quantity || 1,
                   name: item.name,
                   color: item.color,
                   imageUrl: item.imageUrl,
                   description: item.description
                 });
                 
                 // Добавляем предмет в инвентарь
                 await addItemToInventoryDirect(userId, reward.itemId, reward.quantity || 1, transaction);
               }
             }
           }
         }
       }
 
       // ВЫДАЕМ СЛУЧАЙНЫЙ СЕРЫЙ ПРЕДМЕТ ПОСЛЕ КАЖДОГО БОЯ
       const randomGrayItem = await getRandomGrayItem();
       if (randomGrayItem) {
         // ✅ ДОБАВЛЕНО: Сохраняем отдельно для фронтенда
         rewards.randomGrayItem = {
           itemId: randomGrayItem.id,
           name: randomGrayItem.name,
           color: randomGrayItem.color,
           imageUrl: randomGrayItem.imageUrl,
           description: randomGrayItem.description,
           type: randomGrayItem.type
         };
 
         // ✅ ДОБАВЛЕНО: Также добавляем в общий список предметов для обратной совместимости
         rewards.items.push({
           itemId: randomGrayItem.id,
           quantity: 1,
           name: randomGrayItem.name,
           color: randomGrayItem.color,
           imageUrl: randomGrayItem.imageUrl,
           description: randomGrayItem.description
         });
 
         await addItemToInventoryDirect(userId, randomGrayItem.id, 1, transaction);
         console.log(`🎁 Выдан случайный серый предмет: ${randomGrayItem.name}`);
       }
 
       // Проверяем повышение уровня
       const expForNextLevel = user.level * 100;
       if (user.experience >= expForNextLevel) {
         user.level += 1;
         user.experience -= expForNextLevel;
         console.log(`🎉 Пользователь ${userId} повысил уровень до ${user.level}`);
       }
       
       await user.save({ transaction });
 
       await transaction.commit();
 
       // Получаем обновленные данные пользователя
       const updatedUser = await User.findByPk(userId);
       
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
           id: updatedUser.id,
           gold: updatedUser.gold,
           experience: updatedUser.experience,
           level: updatedUser.level,
           energy: updatedUser.energy
         },
         levelUp: user.experience === 0 && !wasCompleted
       });
 
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
 
   } catch (error) {
     console.error('❌ Ошибка завершения уровня кампании:', error);
     res.status(500).json({ error: error.message });
   }
 };

// Вспомогательная функция для добавления предмета в инвентарь
const addItemToInventoryDirect = async (userId, itemId, quantity, transaction) => {
   console.log('======================addItemToInventoryDirect=============')
  try {
    const existingItem = await Inventory.findOne({
      where: { userId, itemId },
      transaction
    });

    const item = await Item.findByPk(itemId, { transaction });
    
    if (!item) {
      throw new Error('Предмет не найден');
    }

    if (existingItem) {
      if (existingItem.quantity + quantity <= item.maxStack) {
        await existingItem.increment('quantity', { by: quantity, transaction });
      } else {
        existingItem.quantity = item.maxStack;
        await existingItem.save({ transaction });
      }
    } else {
      await Inventory.create({
        userId,
        itemId,
        quantity
      }, { transaction });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка добавления предмета:', error);
    throw error;
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
  claimCampaignReward,
};
