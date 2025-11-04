const { Campaign, CampaignLevel, CampaignProgress, User } = require('../db/models');


const getCampaigns = async (req, res) => {
   try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Получаем активные кампании, доступные по уровню
      const campaigns = await Campaign.findAll({
        where: {
          isActive: true,
          requiredLevel: { [db.Sequelize.Op.lte]: user.level }
        },
        include: [
          {
            model: CampaignLevel,
            as: 'levels',
            order: [['levelNumber', 'ASC']],
            include: [
              {
                model: CampaignProgress,
                where: { userId },
                required: false
              }
            ]
          }
        ],
        order: [['order', 'ASC']]
      });
  
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting campaigns:', error);
      res.status(500).json({ error: error.message });
    }
  };
/**
 * Получить уровни кампании
 */
const getCampaignLevels = async (req, res) => {
   try {
     const { campaignId } = req.params;
     const levels = await CampaignLevel.findAll({
       where: { campaignId },
       order: [['levelNumber', 'ASC']]
     });
     res.json(levels);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
/**
 * Начать уровень кампании
 * Логика: Проверка энергии, requiredLevel, создание CampaignProgress
 */
const startCampaignLevel = async (req, res) => {
   try {
      const { userId, campaignLevelId } = req.body;
      
      if (!userId || !campaignLevelId) {
        return res.status(400).json({ error: 'User ID and Campaign Level ID are required' });
      }
  
      const user = await User.findByPk(userId);
      const campaignLevel = await CampaignLevel.findByPk(campaignLevelId, {
        include: [{ model: Campaign, as: 'campaign' }]
      });
  
      if (!user || !campaignLevel) {
        return res.status(404).json({ error: 'User or campaign level not found' });
      }
  
      // Проверяем уровень доступа
      if (user.level < campaignLevel.campaign.requiredLevel) {
        return res.status(400).json({ error: 'User level too low for this campaign' });
      }
  
      // Проверяем энергию
      if (user.energy < campaignLevel.energyCost) {
        return res.status(400).json({ error: 'Not enough energy' });
      }
  
      // Списываем энергию
      user.energy -= campaignLevel.energyCost;
      await user.save();
  
      // Создаем или обновляем прогресс
      const [progress, created] = await CampaignProgress.findOrCreate({
        where: { 
          userId, 
          levelId: campaignLevelId 
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
  
      res.json({
        success: true,
        campaignLevel,
        progress,
        userEnergy: user.energy,
        enemyDeck: campaignLevel.enemyDeck // Отправляем колоду противника для битвы
      });
  
    } catch (error) {
      console.error('Error starting campaign level:', error);
      res.status(500).json({ error: error.message });
    }
  };

/**
 * Получить прогресс кампании пользователя
 * Логика: Получение всех CampaignProgress с информацией о звездах и лучших результатах
 */
const getCampaignProgress = async (req, res) => {
   try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      const progress = await CampaignProgress.findAll({
        where: { userId },
        include: [
          {
            model: CampaignLevel,
            as: 'campaignLevel',
            include: [
              {
                model: Campaign,
                as: 'campaign'
              }
            ]
          }
        ]
      });
  
      // Группируем по кампаниям
      const groupedProgress = progress.reduce((acc, item) => {
        const campaignId = item.campaignLevel.campaign.id;
        if (!acc[campaignId]) {
          acc[campaignId] = {
            campaign: item.campaignLevel.campaign,
            levels: []
          };
        }
        acc[campaignId].levels.push(item);
        return acc;
      }, {});
  
      res.json(groupedProgress);
    } catch (error) {
      console.error('Error getting campaign progress:', error);
      res.status(500).json({ error: error.message });
    }
  };
/**
 * Завершить уровень кампании и получить награду
 */
const claimCampaignReward = async (req, res) => {
   try {
     const { levelId } = req.params;
     const { userId, stars, score } = req.body;
     
     if (!userId || !levelId) {
       return res.status(400).json({ error: 'User ID and Level ID are required' });
     }
 
     // Находим прогресс
     const progress = await CampaignProgress.findOne({
       where: { userId, levelId },
       include: [
         {
           model: CampaignLevel,
           as: 'campaignLevel'
         }
       ]
     });
 
     if (!progress) {
       return res.status(404).json({ error: 'Campaign progress not found' });
     }
 
     // Обновляем прогресс
     progress.completed = true;
     if (stars > progress.stars) {
       progress.stars = stars;
     }
     if (score > progress.bestScore) {
       progress.bestScore = score;
     }
     progress.completedAt = new Date();
     await progress.save();
 
     // Награждаем пользователя
     const user = await User.findByPk(userId);
     const campaignLevel = progress.campaignLevel;
     
     user.gold += campaignLevel.goldReward;
     user.experience += campaignLevel.expReward;
     
     // Проверяем повышение уровня
     const expForNextLevel = user.level * 100;
     if (user.experience >= expForNextLevel) {
       user.level += 1;
       user.experience -= expForNextLevel;
     }
     
     await user.save();
 
     res.json({
       success: true,
       progress,
       rewards: {
         gold: campaignLevel.goldReward,
         experience: campaignLevel.expReward
       },
       user: {
         gold: user.gold,
         experience: user.experience,
         level: user.level,
         energy: user.energy
       },
       levelUp: user.experience === 0 // Если опыт обнулился - был уровень ап
     });
 
   } catch (error) {
     console.error('Error claiming campaign reward:', error);
     res.status(500).json({ error: error.message });
   }
 };
module.exports = {
  getCampaigns,
  getCampaignLevels: async (req, res) => {},
  startCampaignLevel,
  getCampaignProgress,
  claimCampaignReward: async (req, res) => {},
  getCampaignLevels,
  claimCampaignReward
};
