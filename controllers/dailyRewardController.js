const { User, DailyReward, Inventory, Item } = require('../db/models');

/**
 * Получить статус ежедневной награды
 */
const getDailyRewardStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Находим последнюю награду пользователя
    const lastReward = await DailyReward.findOne({
      where: { userId },
      order: [['claimedAt', 'DESC']]
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastClaimDate = lastReward ? new Date(lastReward.claimedAt) : new Date(0);
    const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate());

    const canClaim = lastClaimDay < today;
    const streak = canClaim ? (lastReward ? lastReward.streak + 1 : 1) : (lastReward ? lastReward.streak : 0);
    const nextAvailableAt = canClaim ? now : new Date(today.getTime() + 24 * 60 * 60 * 1000);

    res.json({
      canClaim,
      streak,
      nextAvailableAt,
      lastClaimedAt: lastReward?.claimedAt || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить ежедневную награду
 */
const claimDailyReward = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем возможность получения награды
    const rewardStatus = await getDailyRewardStatus({ params: { userId } });
    if (!rewardStatus.canClaim) {
      return res.status(400).json({ error: 'Награда уже получена сегодня' });
    }

    const streak = rewardStatus.streak;
    const dayOfWeek = streak % 7 || 7; // 1-7 дни

    // Определяем награду на основе стрика
    const rewards = getDailyRewardsByStreak(streak);

    // Выдаем награды
    if (rewards.gold) {
      await user.increment('gold', { by: rewards.gold });
    }
    if (rewards.exp) {
      await user.increment('experience', { by: rewards.exp });
    }
    if (rewards.gems) {
      await user.increment('gems', { by: rewards.gems });
    }

    // Выдаем предметы
    if (rewards.items && rewards.items.length > 0) {
      for (const itemReward of rewards.items) {
        const item = await Item.findByPk(itemReward.itemId);
        if (item) {
          await Inventory.create({
            userId,
            itemId: item.id,
            quantity: itemReward.quantity || 1
          });
        }
      }
    }

    // Создаем запись о полученной награде
    const dailyReward = await DailyReward.create({
      userId,
      rewardType: 'daily',
      claimedAt: new Date(),
      streak: streak,
      rewards: rewards
    });

    // Обновляем пользователя
    await user.reload();

    res.json({
      success: true,
      streak: streak,
      rewards: rewards,
      user: {
        gold: user.gold,
        gems: user.gems,
        experience: user.experience,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Генерация наград на основе стрика
 */
const getDailyRewardsByStreak = (streak) => {
  const day = streak % 7 || 7;
  
  const rewardsByDay = {
    1: { gold: 50, exp: 25 },
    2: { gold: 100, exp: 50 },
    3: { gold: 150, gems: 5 },
    4: { gold: 200, exp: 100 },
    5: { gold: 250, gems: 10 },
    6: { gold: 300, exp: 150 },
    7: { gold: 500, gems: 25, items: [{ itemId: 'premium_chest', quantity: 1 }] }
  };

  // Бонус за длинную серию
  const weekBonus = Math.floor(streak / 7);
  const baseRewards = rewardsByDay[day] || rewardsByDay[1];

  return {
    gold: baseRewards.gold * (1 + weekBonus * 0.1),
    exp: baseRewards.exp * (1 + weekBonus * 0.1),
    gems: (baseRewards.gems || 0) * (1 + weekBonus * 0.1),
    items: baseRewards.items || []
  };
};

module.exports = {
  getDailyRewardStatus,
  claimDailyReward
};
