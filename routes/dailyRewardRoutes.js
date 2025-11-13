// routes/dailyRewards.js
const express = require('express');
const router = express.Router();
const { DailyReward, User } = require('../db/models');

// Получение статуса наград
router.get('/status', async (req, res) => {
  try {
    const { telegramId,userId } = req.query;
    console.log('📦 GET /api/daily-rewards/status для:', { telegramId, userId });

    let user;
    
    // ✅ ИСПРАВЛЕНО: поддерживаем оба типа идентификаторов
    if (telegramId) {
      user = await User.findOne({ where: { telegramId } });
    } else if (userId) {
      user = await User.findByPk(userId);
    }
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const rewards = await DailyReward.findAll({ 
      where: { userId: user.id } 
    });

    const rewardData = {
      rewards: {}
    };

    // Инициализация наград если их нет
    const rewardTypes = ['gray', 'green', 'blue'];
    for (const type of rewardTypes) {
      let reward = rewards.find(r => r.rewardType === type);
      
      if (!reward) {
        reward = await DailyReward.create({
          userId: user.id,
          rewardType: type,
          lastClaimedAt: null,
          nextAvailableAt: null,
          claimCount: 0,
          streak: 0
        });
      }

      const now = new Date();
      const canClaim = !reward.nextAvailableAt || new Date(reward.nextAvailableAt) <= now;

      rewardData.rewards[type] = {
        canClaim,
        nextAvailableAt: reward.nextAvailableAt,
        lastClaimedAt: reward.lastClaimedAt,
        claimCount: reward.claimCount,
        streak: reward.streak
      };
    }

    res.json(rewardData);
  } catch (error) {
    console.error('Ошибка получения статуса наград:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение награды
router.post('/claim', async (req, res) => {
  try {
    const { telegramId, userId,rewardType } = req.body;
    console.log('🎁 POST /api/daily-rewards/claim:', { telegramId, userId, rewardType });

    let user;
    
    // ✅ ИСПРАВЛЕНО: поддерживаем оба типа идентификаторов
    if (telegramId) {
      user = await User.findOne({ where: { telegramId } });
    } else if (userId) {
      user = await User.findByPk(userId);
    }
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const reward = await DailyReward.findOne({ 
      where: { userId: user.id, rewardType } 
    });

    if (!reward) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }

    const now = new Date();
    if (reward.nextAvailableAt && new Date(reward.nextAvailableAt) > now) {
      return res.status(400).json({ error: 'Награда еще не доступна' });
    }

    // Расчет времени следующей доступности
    const cooldowns = {
      gray: 24 * 60 * 60 * 1000, // 24 часа
      green: 72 * 60 * 60 * 1000, // 72 часа
      blue: 7 * 24 * 60 * 60 * 1000 // 7 дней
    };

    const nextAvailableAt = new Date(now.getTime() + cooldowns[rewardType]);

    // Обновление прогресса
    await reward.update({
      lastClaimedAt: now,
      nextAvailableAt,
      claimCount: reward.claimCount + 1,
      streak: reward.streak + 1
    });

    // Генерация награды
    const rewardResult = generateReward(rewardType, reward.streak + 1);

    // Обновление ресурсов пользователя
    await user.update({
      gold: user.gold + (rewardResult.gold || 0),
      crystals: user.crystals + (rewardResult.crystals || 0),
      energy: Math.min(user.energy + (rewardResult.energy || 0), user.maxEnergy)
    });

    res.json({
      success: true,
      message: `Вы получили ${rewardType} награду!`,
      ...rewardResult
    });

  } catch (error) {
    console.error('Ошибка получения награды:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

function generateReward(rewardType, streak) {
  // Логика генерации наград в зависимости от типа и стрика
  const rewards = {
    gray: { gold: 50, energy: 10 },
    green: { gold: 150, crystals: 5, energy: 25 },
    blue: { gold: 500, crystals: 20, energy: 50 }
  };

  return {
    ...rewards[rewardType],
    streakBonus: Math.floor(streak / 7) * 10 // Бонус за каждые 7 дней стрика
  };
}

module.exports = router;
