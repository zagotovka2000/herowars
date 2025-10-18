const { Op } = require('sequelize');

class UserService {
  constructor(models) {
    this.models = models;
  }

  async findOrCreate(telegramId, username) {
    try {
      const [user, created] = await this.models.User.findOrCreate({
        where: { telegramId },
        defaults: {
          username,
          level: 1,
          experience: 0,
          gold: 1000,
          gems: 50,
          lastBattleAt: null
        }
      });

      if (created) {
        console.log(`✅ Создан новый пользователь: ${username} (${telegramId})`);
        // Создаем стартовых героев для нового пользователя
        await this.createStarterHeroes(user.id);
      }

      return user;
    } catch (error) {
      console.error('UserService.findOrCreate error:', error);
      throw error;
    }
  }

  async findByTelegramId(telegramId) {
    try {
      const user = await this.models.User.findOne({
        where: { telegramId },
        include: [
          { model: this.models.Hero },
          { 
            model: this.models.Team, 
            include: [{ model: this.models.Hero }] 
          }
        ]
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      return user;
    } catch (error) {
      console.error('UserService.findByTelegramId error:', error);
      throw error;
    }
  }

  async findById(userId) {
    try {
      const user = await this.models.User.findByPk(userId, {
        include: [
          { model: this.models.Hero },
          { 
            model: this.models.Team, 
            include: [{ model: this.models.Hero }] 
          }
        ]
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      return user;
    } catch (error) {
      console.error('UserService.findById error:', error);
      throw error;
    }
  }

  async findRandomOpponent(currentUserId) {
    try {
      // Ищем случайного пользователя, у которого есть активная команда с 5 героями
      const opponent = await this.models.User.findOne({
        where: {
          id: { [Op.ne]: currentUserId }
        },
        include: [{
          model: this.models.Team,
          where: { isActive: true },
          include: [{
            model: this.models.Hero,
            where: { isActive: true },
            required: true
          }]
        }],
        order: this.models.sequelize.random()
      });

      if (!opponent) {
        // Если не нашли подходящего противника, создаем бота
        return await this.createBotUser();
      }

      return opponent;
    } catch (error) {
      console.error('UserService.findRandomOpponent error:', error);
      // В случае ошибки создаем бота
      return await this.createBotUser();
    }
  }

  async createBotUser() {
    try {
      const botUser = await this.models.User.create({
        telegramId: Math.floor(Math.random() * 1000000) * -1, // Отрицательные ID для ботов
        username: 'Бот-противник',
        level: 1,
        experience: 0,
        gold: 0,
        gems: 0
      });

      // Создаем команду бота
      await this.createBotTeam(botUser.id);

      return await this.findById(botUser.id);
    } catch (error) {
      console.error('UserService.createBotUser error:', error);
      throw error;
    }
  }

  async createBotTeam(userId) {
    try {
      const botTeam = await this.models.Team.create({
        name: 'Команда бота',
        isActive: true,
        userId: userId
      });

      // Создаем героев для бота
      const botHeroes = [
        {
          name: 'Воин бота',
          level: 1,
          health: 100,
          attack: 15,
          defense: 8,
          speed: 5,
          criticalChance: 0.1,
          criticalDamage: 1.5,
          heroClass: 'warrior',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Лучник бота',
          level: 1,
          health: 80,
          attack: 20,
          defense: 5,
          speed: 8,
          criticalChance: 0.15,
          criticalDamage: 2.0,
          heroClass: 'archer',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Маг бота',
          level: 1,
          health: 70,
          attack: 25,
          defense: 3,
          speed: 6,
          criticalChance: 0.12,
          criticalDamage: 2.2,
          heroClass: 'mage',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Танк бота',
          level: 1,
          health: 120,
          attack: 10,
          defense: 12,
          speed: 3,
          criticalChance: 0.05,
          criticalDamage: 1.3,
          heroClass: 'tank',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Лекарь бота',
          level: 1,
          health: 90,
          attack: 12,
          defense: 6,
          speed: 7,
          criticalChance: 0.08,
          criticalDamage: 1.8,
          heroClass: 'healer',
          rarity: 'common',
          userId: userId
        }
      ];

      const createdHeroes = await this.models.Hero.bulkCreate(botHeroes);

      // Добавляем героев в команду
      for (let i = 0; i < createdHeroes.length; i++) {
        await this.models.TeamHero.create({
          teamId: botTeam.id,
          heroId: createdHeroes[i].id,
          position: i + 1
        });
      }

      return botTeam;
    } catch (error) {
      console.error('UserService.createBotTeam error:', error);
      throw error;
    }
  }

  async createStarterHeroes(userId) {
    try {
      const starterHeroes = [
        {
          name: 'Начальный воин',
          level: 1,
          health: 100,
          attack: 15,
          defense: 8,
          speed: 5,
          criticalChance: 0.1,
          criticalDamage: 1.5,
          heroClass: 'warrior',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Начальный лучник',
          level: 1,
          health: 80,
          attack: 20,
          defense: 5,
          speed: 8,
          criticalChance: 0.15,
          criticalDamage: 2.0,
          heroClass: 'archer',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Начальный маг',
          level: 1,
          health: 70,
          attack: 25,
          defense: 3,
          speed: 6,
          criticalChance: 0.12,
          criticalDamage: 2.2,
          heroClass: 'mage',
          rarity: 'common',
          userId: userId
        }
      ];

      await this.models.Hero.bulkCreate(starterHeroes);
      console.log(`✅ Созданы стартовые герои для пользователя ${userId}`);
    } catch (error) {
      console.error('UserService.createStarterHeroes error:', error);
      throw error;
    }
  }

  async updateUserResources(userId, resources) {
    try {
      const user = await this.findById(userId);
      
      const updateData = {};
      if (resources.gold !== undefined) {
        updateData.gold = user.gold + resources.gold;
      }
      if (resources.gems !== undefined) {
        updateData.gems = user.gems + resources.gems;
      }
      if (resources.experience !== undefined) {
        updateData.experience = user.experience + resources.experience;
        
        // Проверка повышения уровня
        const requiredExp = user.level * 100;
        if (updateData.experience >= requiredExp) {
          updateData.level = user.level + 1;
          updateData.experience = updateData.experience - requiredExp;
        }
      }

      await user.update(updateData);
      return user;
    } catch (error) {
      console.error('UserService.updateUserResources error:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const user = await this.findById(userId);
      const heroesCount = await this.models.Hero.count({ where: { userId } });
      const battlesCount = await this.models.Battle.count({
        where: {
          [Op.or]: [
            { player1Id: userId },
            { player2Id: userId }
          ],
          status: 'completed'
        }
      });
      const winsCount = await this.models.Battle.count({
        where: { winnerId: userId }
      });

      return {
        user,
        heroesCount,
        battlesCount,
        winsCount,
        winRate: battlesCount > 0 ? (winsCount / battlesCount * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      throw error;
    }
  }
}

module.exports = UserService;
