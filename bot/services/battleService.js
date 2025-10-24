const { Op } = require('sequelize');

class BattleService {
  constructor(models) {
    this.models = models;
  }

  async createBattle(player1Id, player2Id) {
    return await this.models.Battle.create({
      player1Id,
      player2Id,
      status: 'in_progress'
    });
  }

  // Новая функция для пошаговой симуляции боя (для Web App)
  async simulateBattleStepByStep(team1, team2) {
    const battleState = {
      round: 1,
      heroes1: team1.Heroes.map(hero => ({
        ...hero.get(),
        currentHealth: hero.health,
        maxHealth: hero.health,
        team: 'team1',
        emoji: this.getHeroEmoji(hero.heroClass),
        isAlive: true
      })),
      heroes2: team2.Heroes.map(hero => ({
        ...hero.get(),
        currentHealth: hero.health,
        maxHealth: hero.health,
        team: 'team2',
        emoji: this.getHeroEmoji(hero.heroClass),
        isAlive: true
      })),
      log: [],
      isFinished: false,
      winner: null,
      currentAction: null
    };

    const battleSteps = [];

    while (this.isTeamAlive(battleState.heroes1) && 
           this.isTeamAlive(battleState.heroes2) && 
           battleState.round <= 50) {
      
      battleState.log.push(`=== Раунд ${battleState.round} ===`);
      battleSteps.push(this.cloneBattleState(battleState));

      // Герои атакуют в порядке скорости
      const allHeroes = [...battleState.heroes1, ...battleState.heroes2]
        .filter(hero => hero.isAlive)
        .sort((a, b) => b.speed - a.speed);

      for (const attacker of allHeroes) {
        if (!attacker.isAlive) continue;

        const isAttackerInTeam1 = battleState.heroes1.includes(attacker);
        const targets = isAttackerInTeam1 ? battleState.heroes2 : battleState.heroes1;
        
        if (!this.isTeamAlive(targets)) break;

        const target = this.selectTarget(targets);
        const damage = this.calculateDamage(attacker, target);
        
        // Сохраняем состояние до атаки
        const preAttackHealth = target.currentHealth;
        target.currentHealth = Math.max(0, target.currentHealth - damage);
        
        // Обновляем статус жив/мертв
        target.isAlive = target.currentHealth > 0;

        // Записываем действие
        battleState.currentAction = {
          type: 'attack',
          attacker: attacker.name,
          attackerEmoji: attacker.emoji,
          target: target.name,
          targetEmoji: target.emoji,
          damage: damage,
          isCritical: damage > attacker.attack,
          preAttackHealth: preAttackHealth,
          postAttackHealth: target.currentHealth,
          targetDied: !target.isAlive
        };

        const criticalText = damage > attacker.attack ? ' 💥 КРИТИЧЕСКИЙ УДАР!' : '';
        battleState.log.push(
          `${attacker.name} ${attacker.emoji} атакует ${target.name} ${target.emoji} и наносит ${damage} урона!${criticalText}`
        );

        // Сохраняем шаг с действием
        battleSteps.push(this.cloneBattleState(battleState));

        // Если цель умерла, добавляем отдельный шаг
        if (!target.isAlive) {
          battleState.currentAction = {
            type: 'death',
            target: target.name,
            targetEmoji: target.emoji
          };
          battleState.log.push(`💀 ${target.name} повержен!`);
          battleSteps.push(this.cloneBattleState(battleState));
        }

        // Сбрасываем текущее действие
        battleState.currentAction = null;
      }
      
      battleState.round++;
    }

    // Определяем победителя
    const team1Alive = this.isTeamAlive(battleState.heroes1);
    const team2Alive = this.isTeamAlive(battleState.heroes2);

    if (team1Alive && !team2Alive) {
      battleState.winner = 'team1';
      battleState.log.push('🎉 Команда 1 побеждает!');
    } else if (!team1Alive && team2Alive) {
      battleState.winner = 'team2';
      battleState.log.push('🎉 Команда 2 побеждает!');
    } else {
      battleState.winner = 'draw';
      battleState.log.push('⚔️ Битва завершилась вничью!');
    }

    battleState.isFinished = true;
    battleSteps.push(this.cloneBattleState(battleState));

    return battleSteps;
  }

  // Старая функция для совместимости (можно удалить после перехода на Web App)
  async simulateBattle(team1, team2) {
    const steps = await this.simulateBattleStepByStep(team1, team2);
    const finalStep = steps[steps.length - 1];
    
    return {
      winner: finalStep.winner,
      log: finalStep.log.join('\n')
    };
  }

  isTeamAlive(heroes) {
    return heroes.some(hero => hero.isAlive);
  }

  selectTarget(targets) {
    const aliveTargets = targets.filter(hero => hero.isAlive);
    if (aliveTargets.length === 0) return targets[0];
    
    return aliveTargets.reduce((lowest, current) => 
      current.currentHealth < lowest.currentHealth ? current : lowest
    );
  }

  calculateDamage(attacker, defender) {
    let damage = attacker.attack - (defender.defense * 0.3);
    damage = Math.max(1, damage);

    const isCritical = Math.random() < attacker.criticalChance;
    if (isCritical) {
      damage *= attacker.criticalDamage;
    }

    return Math.round(damage);
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

  cloneBattleState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  // Новая функция для получения случайного противника
  async getRandomOpponentTeam(currentUserId) {
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
        return await this.createBotTeam();
      }

      return opponent.Team;
    } catch (error) {
      console.error('BattleService.getRandomOpponentTeam error:', error);
      return await this.createBotTeam();
    }
  }

  async createBotTeam() {
    const botHeroes = [
      {
        name: 'Бот-Воин',
        level: 1,
        health: 100,
        attack: 15,
        defense: 8,
        speed: 5,
        criticalChance: 0.1,
        criticalDamage: 1.5,
        heroClass: 'warrior',
        rarity: 'common',
        isActive: true
      },
      {
        name: 'Бот-Лучник',
        level: 1,
        health: 80,
        attack: 20,
        defense: 5,
        speed: 8,
        criticalChance: 0.15,
        criticalDamage: 2.0,
        heroClass: 'archer',
        rarity: 'common',
        isActive: true
      },
      {
        name: 'Бот-Маг',
        level: 1,
        health: 70,
        attack: 25,
        defense: 3,
        speed: 6,
        criticalChance: 0.12,
        criticalDamage: 2.2,
        heroClass: 'mage',
        rarity: 'common',
        isActive: true
      },
      {
        name: 'Бот-Танк',
        level: 1,
        health: 120,
        attack: 10,
        defense: 12,
        speed: 3,
        criticalChance: 0.05,
        criticalDamage: 1.3,
        heroClass: 'tank',
        rarity: 'common',
        isActive: true
      },
      {
        name: 'Бот-Ассассин',
        level: 1,
        health: 75,
        attack: 22,
        defense: 4,
        speed: 9,
        criticalChance: 0.18,
        criticalDamage: 2.5,
        heroClass: 'assassin',
        rarity: 'common',
        isActive: true
      }
    ];

    return {
      id: -1,
      name: 'Команда бота',
      Heroes: botHeroes
    };
  }
}

module.exports = BattleService;
