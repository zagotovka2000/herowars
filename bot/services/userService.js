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
          gold: 5000,
          gems: 500,
          lastBattleAt: null
        }
      });

      if (created) {
        console.log(`✅ Создан новый пользователь: ${username} (${telegramId})`);
        await this.createStarterHeroes(user.id);
        await this.createStarterTeam(user.id);
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
        return await this.createBotUser();
      }

      return opponent;
    } catch (error) {
      console.error('UserService.findRandomOpponent error:', error);
      return await this.createBotUser();
    }
  }

  async createBotUser() {
    try {
      const botUser = await this.models.User.create({
        telegramId: Math.floor(Math.random() * 1000000) * -1,
        username: 'Бот-противник',
        level: 1,
        experience: 0,
        gold: 0,
        gems: 0
      });

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
        },
        {
          name: 'Ассассин бота',
          level: 1,
          health: 75,
          attack: 22,
          defense: 4,
          speed: 9,
          criticalChance: 0.18,
          criticalDamage: 2.5,
          heroClass: 'assassin',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Поддержка бота',
          level: 1,
          health: 85,
          attack: 8,
          defense: 7,
          speed: 6,
          criticalChance: 0.06,
          criticalDamage: 1.6,
          heroClass: 'support',
          rarity: 'common',
          userId: userId
        }
      ];

      // Выбираем случайных 5 героев из 7 возможных для бота
      const shuffledHeroes = botHeroes.sort(() => 0.5 - Math.random());
      const selectedHeroes = shuffledHeroes.slice(0, 5);

      const createdHeroes = await this.models.Hero.bulkCreate(selectedHeroes);

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
        },
        {
          name: 'Начальный танк',
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
          name: 'Начальный лекарь',
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
        },
        {
          name: 'Начальный ассассин',
          level: 1,
          health: 75,
          attack: 22,
          defense: 4,
          speed: 9,
          criticalChance: 0.18,
          criticalDamage: 2.5,
          heroClass: 'assassin',
          rarity: 'common',
          userId: userId
        },
        {
          name: 'Начальный поддержка',
          level: 1,
          health: 85,
          attack: 8,
          defense: 7,
          speed: 6,
          criticalChance: 0.06,
          criticalDamage: 1.6,
          heroClass: 'support',
          rarity: 'common',
          userId: userId
        }
      ];

      // Выбираем случайных 5 героев из 7 возможных для игрока
      const shuffledHeroes = starterHeroes.sort(() => 0.5 - Math.random());
      const selectedHeroes = shuffledHeroes.slice(0, 5);

      await this.models.Hero.bulkCreate(selectedHeroes);
      console.log(`✅ Созданы 5 случайных стартовых героев для пользователя ${userId}`);
      
      // Логируем какие герои были созданы
      const createdHeroes = await this.models.Hero.findAll({
        where: { userId },
        attributes: ['name', 'heroClass']
      });
      console.log(`🎯 Созданные герои:`, createdHeroes.map(h => `${h.name} (${h.heroClass})`));

    } catch (error) {
      console.error('UserService.createStarterHeroes error:', error);
      throw error;
    }
  }

  async createStarterTeam(userId) {
    try {
      const team = await this.models.Team.create({
        name: 'Стартовая команда',
        isActive: true,
        userId: userId
      });

      const heroes = await this.models.Hero.findAll({
        where: { userId },
        limit: 5
      });

      for (let i = 0; i < heroes.length; i++) {
        await this.models.TeamHero.create({
          teamId: team.id,
          heroId: heroes[i].id,
          position: i + 1
        });
      }

      console.log(`✅ Создана стартовая команда для пользователя ${userId}`);
      return team;
    } catch (error) {
      console.error('UserService.createStarterTeam error:', error);
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

  async getTeamManagementInfo(telegramId) {
    try {
      const user = await this.findByTelegramId(telegramId);
      const allHeroes = await this.models.Hero.findAll({
        where: { userId: user.id },
        order: [['level', 'DESC']]
      });

      const activeTeam = await this.models.Team.findOne({
        where: { userId: user.id, isActive: true },
        include: [{
          model: this.models.Hero,
          through: { attributes: ['position'] }
        }]
      });

      const teamHeroes = activeTeam ? 
        activeTeam.Heroes.sort((a, b) => a.TeamHero.position - b.TeamHero.position) : 
        [];

      return {
        user,
        allHeroes,
        activeTeam,
        teamHeroes,
        availableSlots: 5 - teamHeroes.length,
        hasFullTeam: teamHeroes.length === 5
      };
    } catch (error) {
      console.error('UserService.getTeamManagementInfo error:', error);
      throw error;
    }
  }

  async addHeroToTeam(telegramId, heroId, position) {
    try {
      const user = await this.findByTelegramId(telegramId);
      const team = await this.models.Team.findOne({
        where: { userId: user.id, isActive: true }
      });

      if (!team) {
        throw new Error('Сначала создайте команду с помощью /create_team');
      }

      const hero = await this.models.Hero.findOne({
        where: { id: heroId, userId: user.id }
      });

      if (!hero) {
        throw new Error('Герой не найден или не принадлежит вам');
      }

      const existingInTeam = await this.models.TeamHero.findOne({
        where: { teamId: team.id, heroId }
      });

      if (existingInTeam) {
        throw new Error('Этот герой уже в команде');
      }

      if (!position) {
        const occupiedPositions = await this.models.TeamHero.findAll({
          where: { teamId: team.id },
          attributes: ['position']
        });
        
        const occupied = occupiedPositions.map(p => p.position);
        position = [1, 2, 3, 4, 5].find(p => !occupied.includes(p));
        
        if (!position) {
          throw new Error('В команде нет свободных слотов');
        }
      }

      if (position < 1 || position > 5) {
        throw new Error('Позиция должна быть от 1 до 5');
      }

      const positionOccupied = await this.models.TeamHero.findOne({
        where: { teamId: team.id, position }
      });

      if (positionOccupied) {
        throw new Error(`Позиция ${position} уже занята`);
      }

      await this.models.TeamHero.create({
        teamId: team.id,
        heroId: heroId,
        position: position
      });

      return { success: true, position };
    } catch (error) {
      console.error('UserService.addHeroToTeam error:', error);
      throw error;
    }
  }

  async removeHeroFromTeam(telegramId, heroId) {
    try {
      const user = await this.findByTelegramId(telegramId);
      const team = await this.models.Team.findOne({
        where: { userId: user.id, isActive: true }
      });

      if (!team) {
        throw new Error('Активная команда не найдена');
      }

      const result = await this.models.TeamHero.destroy({
        where: { teamId: team.id, heroId }
      });

      if (result === 0) {
        throw new Error('Герой не найден в команде');
      }

      return { success: true };
    } catch (error) {
      console.error('UserService.removeHeroFromTeam error:', error);
      throw error;
    }
  }

  // Новый метод для сортировки героев по классам
  sortHeroesByClass(heroes) {
    const classOrder = {
      'tank': 1,
      'warrior': 2,
      'archer': 3,
      'mage': 4,
      'assassin': 5,
      'healer': 6,
      'support': 7
    };

    return heroes.sort((a, b) => {
      return classOrder[a.heroClass] - classOrder[b.heroClass];
    });
  }

  // Новый метод для получения информации о классах героев
  getHeroClassesInfo() {
    return {
      'warrior': { name: 'Воин', emoji: '⚔️', description: 'Сбалансированный боец' },
      'archer': { name: 'Лучник', emoji: '🏹', description: 'Высокий урон, низкая защита' },
      'mage': { name: 'Маг', emoji: '🔮', description: 'Мощные заклинания' },
      'tank': { name: 'Танк', emoji: '🛡️', description: 'Высокая защита, низкий урон' },
      'healer': { name: 'Лекарь', emoji: '💊', description: 'Лечение союзников' },
      'assassin': { name: 'Ассассин', emoji: '🗡️', description: 'Высокий крит. урон, низкое здоровье' },
      'support': { name: 'Поддержка', emoji: '🎯', description: 'Усиление союзников' }
    };
  }
  async getTeamForWebApp(telegramId) {
   try {
     const user = await this.findByTelegramId(telegramId);
     const activeTeam = await this.models.Team.findOne({
       where: { userId: user.id, isActive: true },
       include: [{
         model: this.models.Hero,
         through: { attributes: ['position'] }
       }]
     });

     const allHeroes = await this.models.Hero.findAll({
       where: { userId: user.id, isActive: true },
       order: [['level', 'DESC']]
     });

     const teamHeroes = activeTeam ? 
       activeTeam.Heroes.sort((a, b) => a.TeamHero.position - b.TeamHero.position) : 
       [];

     return {
       user: {
         id: user.id,
         username: user.username,
         level: user.level,
         gold: user.gold,
         gems: user.gems
       },
       team: activeTeam ? {
         id: activeTeam.id,
         name: activeTeam.name,
         heroes: teamHeroes.map(hero => ({
           id: hero.id,
           name: hero.name,
           level: hero.level,
           health: hero.health,
           attack: hero.attack,
           defense: hero.defense,
           speed: hero.speed,
           criticalChance: hero.criticalChance,
           criticalDamage: hero.criticalDamage,
           heroClass: hero.heroClass,
           rarity: hero.rarity,
           position: hero.TeamHero.position,
           emoji: this.getHeroEmoji(hero.heroClass)
         }))
       } : null,
       availableHeroes: allHeroes
         .filter(hero => !teamHeroes.some(th => th.id === hero.id))
         .map(hero => ({
           id: hero.id,
           name: hero.name,
           level: hero.level,
           health: hero.health,
           attack: hero.attack,
           defense: hero.defense,
           speed: hero.speed,
           criticalChance: hero.criticalChance,
           criticalDamage: hero.criticalDamage,
           heroClass: hero.heroClass,
           rarity: hero.rarity,
           emoji: this.getHeroEmoji(hero.heroClass)
         })),
       maxTeamSize: 5
     };
   } catch (error) {
     console.error('UserService.getTeamForWebApp error:', error);
     throw error;
   }
 }

 // Новый метод для обновления команды из Web App
 async updateTeamFromWebApp(telegramId, heroIds) {
   try {
     const user = await this.findByTelegramId(telegramId);
     
     // Проверяем, что все герои принадлежат пользователю
     const userHeroes = await this.models.Hero.findAll({
       where: { 
         id: { [Op.in]: heroIds },
         userId: user.id 
       }
     });

     if (userHeroes.length !== heroIds.length) {
       throw new Error('Некоторые герои не принадлежат вам');
     }

     // Проверяем на дубликаты
     if (new Set(heroIds).size !== heroIds.length) {
       throw new Error('В команде не может быть одинаковых героев');
     }

     if (heroIds.length > 5) {
       throw new Error('Максимум 5 героев в команде');
     }

     // Находим или создаем активную команду
     let team = await this.models.Team.findOne({
       where: { userId: user.id, isActive: true }
     });

     if (!team) {
       team = await this.models.Team.create({
         name: `Команда ${user.username}`,
         isActive: true,
         userId: user.id
       });
     }

     // Удаляем старых героев из команды
     await this.models.TeamHero.destroy({
       where: { teamId: team.id }
     });

     // Добавляем новых героев
     for (let i = 0; i < heroIds.length; i++) {
       await this.models.TeamHero.create({
         teamId: team.id,
         heroId: heroIds[i],
         position: i + 1
       });
     }

     return { success: true, teamSize: heroIds.length };
   } catch (error) {
     console.error('UserService.updateTeamFromWebApp error:', error);
     throw error;
   }
 }

 getHeroEmoji(heroClass) {
   const emojis = {
     'warrior': '⚔️',
     'archer': '🏹',
     'mage': '🔮',
     'tank': '🛡️',
     'healer': '💊',
     'assassin': '🗡️',
     'support': '🎯'
   };
   return emojis[heroClass] || '👤';
 }
}

module.exports = UserService;
