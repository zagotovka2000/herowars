// controllers/botController.js
const { BotHero, BotCard, Battle, User } = require('../db/models');

/**
 * Получить список ботов для арены (топ-50)
 */
const getArenaBots = async (req, res) => {
  try {
    const bots = await BotHero.findAll({
      order: [['arenaRank', 'ASC']],
      limit: 50,
      include: [{
        model: BotCard
      }]
    });

    res.json(bots);
  } catch (error) {
    console.error('❌ Ошибка получения ботов:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить детальную информацию о боте и его картах
 */
const getBotDetails = async (req, res) => {
  try {
    const { botId } = req.params;

    const bot = await BotHero.findByPk(botId, {
      include: [{
        model: BotCard
      }]
    });

    if (!bot) {
      return res.status(404).json({ error: 'Бот не найден' });
    }

    res.json(bot);
  } catch (error) {
    console.error('❌ Ошибка получения деталей бота:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Начать битву с ботом
 */
const startBotBattle = async (req, res) => {
  try {
    const { botId, playerCards } = req.body;
    const { userId } = req.params;

    // Получаем бота и его карты
    const bot = await BotHero.findByPk(botId, {
      include: [{
        model: BotCard
      }]
    });

    if (!bot) {
      return res.status(404).json({ error: 'Бот не найден' });
    }

    // Преобразуем карты бота в формат для игры
    const botCardsForBattle = bot.BotCards.map(card => ({
      id: card.id,
      value: card.baseAttack,
      health: card.baseHealth,
      maxHealth: card.baseHealth,
      superAttack: 0,
      hasUsedSuperAttack: false,
      isPlayer: false,
      name: card.name,
      imageUrl: card.imageUrl,
      type: card.type
    }));

    // Преобразуем карты игрока
    const playerCardsForBattle = playerCards.map(card => ({
      ...card,
      health: card.baseHealth || card.health || 10,
      maxHealth: card.baseHealth || card.health || 10,
      superAttack: 0,
      hasUsedSuperAttack: false,
      isPlayer: true
    }));

    // Создаем битву в базе данных
    const battle = await Battle.create({
      type: 'pvp',
      player1Id: userId,
      player2Id: null, // Для ботов player2Id = null
      botHeroId: botId,
      status: 'in_progress',
      player1Deck: playerCardsForBattle,
      player2Deck: botCardsForBattle,
      battleType: 'arena_bot',
      turns: [],
      rewards: {
        gold: bot.rewardGold,
        exp: bot.rewardExp,
        items: []
      }
    });

    res.json({
      battleId: battle.id,
      bot: bot,
      playerCards: playerCardsForBattle,
      botCards: botCardsForBattle
    });

  } catch (error) {
    console.error('❌ Ошибка начала битвы с ботом:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Получить случайного бота для быстрой битвы
 */
const getRandomBot = async (req, res) => {
  try {
    // Получаем случайного бота среднего уровня
    const bots = await BotHero.findAll({
      where: {
        level: {
          [Op.between]: [3, 7]
        }
      },
      include: [{
        model: BotCard
      }],
      order: sequelize.random(),
      limit: 1
    });

    if (bots.length === 0) {
      return res.status(404).json({ error: 'Боты не найдены' });
    }

    res.json(bots[0]);
  } catch (error) {
    console.error('❌ Ошибка получения случайного бота:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getArenaBots,
  getBotDetails,
  startBotBattle,
  getRandomBot
};
