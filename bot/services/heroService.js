const { Op } = require('sequelize');

class HeroService {
  constructor(models) {
    this.models = models;
  }

  async getUserHeroes(userId) { // возвращает героев пользователя
    try {
      const heroes = await this.models.Hero.findAll({
        where: { userId },
        order: [['level', 'DESC'], ['createdAt', 'ASC']]
      });

      return heroes;
    } catch (error) {
      console.error('HeroService.getUserHeroes error:', error);
      throw error;
    }
  }

  async getHeroById(heroId) { //возвращает героя по id
    try {
      const hero = await this.models.Hero.findByPk(heroId, {
        include: [{ model: this.models.User }]
      });

      if (!hero) {
        throw new Error('Герой не найден');
      }

      return hero;
    } catch (error) {
      console.error('HeroService.getHeroById error:', error);
      throw error;
    }
  }

  async upgradeHero(heroId, userId) {//улучшает героя (увеличивает характеристики, списывает золото).
    try {
      const hero = await this.getHeroById(heroId);
      const user = await this.models.User.findByPk(userId);

      // Проверяем, принадлежит ли герой пользователю
      if (hero.userId !== parseInt(userId)) {
        throw new Error('Этот герой не принадлежит вам');
      }

      // Стоимость улучшения
      const upgradeCost = hero.level * 100;

      // Проверяем достаточно ли золота
      if (user.gold < upgradeCost) {
        throw new Error(`Недостаточно золота. Нужно: ${upgradeCost}, у вас: ${user.gold}`);
      }

      // Вычисляем новые характеристики
      const newLevel = hero.level + 1;
      const healthIncrease = Math.floor(hero.health * 0.1);
      const attackIncrease = Math.floor(hero.attack * 0.1);
      const defenseIncrease = Math.floor(hero.defense * 0.1);
      const speedIncrease = Math.floor(hero.speed * 0.05);

      // Обновляем героя
      await hero.update({
        level: newLevel,
        health: hero.health + healthIncrease,
        attack: hero.attack + attackIncrease,
        defense: hero.defense + defenseIncrease,
        speed: hero.speed + speedIncrease,
        criticalChance: Math.min(hero.criticalChance + 0.01, 0.5), // Макс 50%
        criticalDamage: Math.min(hero.criticalDamage + 0.05, 3.0) // Макс 300%
      });

      // Списание золота
      await user.update({
        gold: user.gold - upgradeCost
      });

      return {
        hero,
        upgradeCost,
        increases: {
          health: healthIncrease,
          attack: attackIncrease,
          defense: defenseIncrease,
          speed: speedIncrease
        }
      };
    } catch (error) {
      console.error('HeroService.upgradeHero error:', error);
      throw error;
    }
  }

  async createHero(userId, heroData) {
    try {
      const user = await this.models.User.findByPk(userId);

      // Стоимость создания героя
      const createCost = 500;

      if (user.gold < createCost) {
        throw new Error(`Недостаточно золота. Нужно: ${createCost}, у вас: ${user.gold}`);
      }

      const baseStats = this.getBaseStatsByClass(heroData.heroClass);

      const hero = await this.models.Hero.create({
        name: heroData.name,
        level: 1,
        experience: 0,
        health: baseStats.health,
        attack: baseStats.attack,
        defense: baseStats.defense,
        speed: baseStats.speed,
        criticalChance: baseStats.criticalChance,
        criticalDamage: baseStats.criticalDamage,
        heroClass: heroData.heroClass,
        rarity: heroData.rarity || 'common',
        userId: userId
      });

      // Списание золота
      await user.update({
        gold: user.gold - createCost
      });

      return hero;
    } catch (error) {
      console.error('HeroService.createHero error:', error);
      throw error;
    }
  }

  getBaseStatsByClass(heroClass) { //возвращает базовые характеристики для класса героя
    const baseStats = {
      warrior: {
        health: 100,
        attack: 15,
        defense: 8,
        speed: 5,
        criticalChance: 0.1,
        criticalDamage: 1.5
      },
      archer: {
        health: 80,
        attack: 20,
        defense: 5,
        speed: 8,
        criticalChance: 0.15,
        criticalDamage: 2.0
      },
      mage: {
        health: 70,
        attack: 25,
        defense: 3,
        speed: 6,
        criticalChance: 0.12,
        criticalDamage: 2.2
      },
      tank: {
        health: 120,
        attack: 10,
        defense: 12,
        speed: 3,
        criticalChance: 0.05,
        criticalDamage: 1.3
      },
      healer: {
        health: 90,
        attack: 12,
        defense: 6,
        speed: 7,
        criticalChance: 0.08,
        criticalDamage: 1.8
      }
    };

    return baseStats[heroClass] || baseStats.warrior;
  }

  async addHeroToTeam(heroId, teamId, position) {
    try {
      // Проверяем, не занята ли позиция
      const existingHeroInPosition = await this.models.TeamHero.findOne({
        where: { teamId, position }
      });

      if (existingHeroInPosition) {
        throw new Error(`Позиция ${position} уже занята`);
      }

      // Проверяем, не добавлен ли уже герой в команду
      const existingHero = await this.models.TeamHero.findOne({
        where: { teamId, heroId }
      });

      if (existingHero) {
        throw new Error('Этот герой уже в команде');
      }

      // Проверяем максимальное количество героев в команде (5)
      const teamHeroesCount = await this.models.TeamHero.count({
        where: { teamId }
      });

      if (teamHeroesCount >= 5) {
        throw new Error('В команде уже максимальное количество героев (5)');
      }

      // Добавляем героя в команду
      const teamHero = await this.models.TeamHero.create({
        teamId,
        heroId,
        position: position || teamHeroesCount + 1
      });

      return teamHero;
    } catch (error) {
      console.error('HeroService.addHeroToTeam error:', error);
      throw error;
    }
  }

  async removeHeroFromTeam(heroId, teamId) {
    try {
      const result = await this.models.TeamHero.destroy({
        where: { teamId, heroId }
      });

      if (result === 0) {
        throw new Error('Герой не найден в команде');
      }

      return true;
    } catch (error) {
      console.error('HeroService.removeHeroFromTeam error:', error);
      throw error;
    }
  }

  async getTeamHeroes(teamId) { //возвращает героев команды.
    try {
      const teamHeroes = await this.models.TeamHero.findAll({
        where: { teamId },
        include: [{ model: this.models.Hero }],
        order: [['position', 'ASC']]
      });

      return teamHeroes.map(th => th.Hero);
    } catch (error) {
      console.error('HeroService.getTeamHeroes error:', error);
      throw error;
    }
  }

  async calculateTeamPower(teamId) {
    try {
      const heroes = await this.getTeamHeroes(teamId);
      
      let totalPower = 0;
      heroes.forEach(hero => {
        const heroPower = hero.health * 0.1 + hero.attack * 2 + hero.defense * 1.5 + hero.speed;
        totalPower += heroPower * hero.level;
      });

      return Math.round(totalPower);
    } catch (error) {
      console.error('HeroService.calculateTeamPower error:', error);
      throw error;
    }
  }

  async createRandomHero(userId, cost = 500) {
   try {
     const user = await this.models.User.findByPk(userId);
     
     if (user.gold < cost) {
       throw new Error(`Недостаточно золота. Нужно: ${cost}, у вас: ${user.gold}`);
     }
 
     const heroClasses = ['warrior', 'archer', 'mage', 'tank', 'healer'];
     const classNames = {
       warrior: 'Воин',
       archer: 'Лучник', 
       mage: 'Маг',
       tank: 'Танк',
       healer: 'Лекарь'
     };
     
     const randomClass = heroClasses[Math.floor(Math.random() * heroClasses.length)];
     const baseStats = this.getBaseStatsByClass(randomClass);
     
     // Генерируем уникальное имя
     const heroName = `${classNames[randomClass]} ${Math.floor(Math.random() * 1000)}`;
 
     const hero = await this.models.Hero.create({
       name: heroName,
       level: 1,
       experience: 0,
       health: baseStats.health,
       attack: baseStats.attack,
       defense: baseStats.defense,
       speed: baseStats.speed,
       criticalChance: baseStats.criticalChance,
       criticalDamage: baseStats.criticalDamage,
       heroClass: randomClass,
       rarity: 'common',
       userId: userId
     });
 
     // Списание золота
     await user.update({
       gold: user.gold - cost
     });
 
     return {
       hero,
       cost,
       newGold: user.gold - cost
     };
   } catch (error) {
     console.error('HeroService.createRandomHero error:', error);
     throw error;
   }
 }
 getBaseStatsByClass(heroClass) {
   const baseStats = {
     warrior: {
       health: 100,
       attack: 15,
       defense: 8,
       speed: 5,
       criticalChance: 0.1,
       criticalDamage: 1.5
     },
     archer: {
       health: 80,
       attack: 20,
       defense: 5,
       speed: 8,
       criticalChance: 0.15,
       criticalDamage: 2.0
     },
     mage: {
       health: 70,
       attack: 25,
       defense: 3,
       speed: 6,
       criticalChance: 0.12,
       criticalDamage: 2.2
     },
     tank: {
       health: 120,
       attack: 10,
       defense: 12,
       speed: 3,
       criticalChance: 0.05,
       criticalDamage: 1.3
     },
     healer: {
       health: 90,
       attack: 12,
       defense: 6,
       speed: 7,
       criticalChance: 0.08,
       criticalDamage: 1.8
     },
     assassin: {
       health: 75,
       attack: 22,
       defense: 4,
       speed: 9,
       criticalChance: 0.18,
       criticalDamage: 2.5
     },
     support: {
       health: 85,
       attack: 8,
       defense: 7,
       speed: 6,
       criticalChance: 0.06,
       criticalDamage: 1.6
     }
   };
 
   return baseStats[heroClass] || baseStats.warrior;
 }

}

module.exports = HeroService;
