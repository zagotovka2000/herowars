const { Op } = require('sequelize');

class BattleService {
  constructor(models) {
    this.models = models;
  }

  async createBattle(player1Id, player2Id) { // создает запись о битве.
    return await this.models.Battle.create({
      player1Id,
      player2Id,
      status: 'in_progress'
    });
  }

  async simulateBattle(team1, team2) {
    const battleLog = [];
    let round = 1;

    // Клонируем героев для битвы
    const heroes1 = team1.Heroes.map(hero => ({ 
      ...hero.get(), 
      currentHealth: hero.health,
      team: 'team1'
    }));
    const heroes2 = team2.Heroes.map(hero => ({ 
      ...hero.get(), 
      currentHealth: hero.health,
      team: 'team2'
    }));

    while (this.isTeamAlive(heroes1) && this.isTeamAlive(heroes2) && round <= 50) {
      battleLog.push(`=== Раунд ${round} ===`);
      
      // Герои атакуют в порядке скорости
      const allHeroes = [...heroes1, ...heroes2]
        .filter(hero => hero.currentHealth > 0)
        .sort((a, b) => b.speed - a.speed);

      for (const attacker of allHeroes) {
        if (attacker.currentHealth <= 0) continue;

        const isAttackerInTeam1 = heroes1.includes(attacker);
        const targets = isAttackerInTeam1 ? heroes2 : heroes1;
        
        if (!this.isTeamAlive(targets)) break;

        const target = this.selectTarget(targets);
        const damage = this.calculateDamage(attacker, target);
        
        target.currentHealth -= damage;
        
        const criticalText = damage > attacker.attack ? ' 💥 КРИТИЧЕСКИЙ УДАР!' : '';
        
        battleLog.push(
          `${attacker.name} атакует ${target.name} и наносит ${damage} урона!${criticalText}` +
          ` (Здоровье ${target.name}: ${Math.max(0, target.currentHealth)})`
        );

        // Проверяем, не умер ли цель после атаки
        if (target.currentHealth <= 0) {
          battleLog.push(`💀 ${target.name} повержен!`);
        }
      }
      
      round++;
    }

    const team1Alive = this.isTeamAlive(heroes1);
    const team2Alive = this.isTeamAlive(heroes2);

    if (team1Alive && !team2Alive) {
      battleLog.push('🎉 Команда 1 побеждает!');
      return { winner: 'team1', log: battleLog.join('\n') };
    } else if (!team1Alive && team2Alive) {
      battleLog.push('🎉 Команда 2 побеждает!');
      return { winner: 'team2', log: battleLog.join('\n') };
    } else {
      battleLog.push('⚔️ Битва завершилась вничью!');
      return { winner: 'draw', log: battleLog.join('\n') };
    }
  }

  isTeamAlive(heroes) {
    return heroes.some(hero => hero.currentHealth > 0);
  }

  selectTarget(targets) {
    // Выбираем цель с наименьшим здоровьем
    const aliveTargets = targets.filter(hero => hero.currentHealth > 0);
    if (aliveTargets.length === 0) return targets[0];
    
    return aliveTargets.reduce((lowest, current) => 
      current.currentHealth < lowest.currentHealth ? current : lowest
    );
  }

  calculateDamage(attacker, defender) {
    let damage = attacker.attack - (defender.defense * 0.3);
    damage = Math.max(1, damage);

    // Проверка критического удара
    const isCritical = Math.random() < attacker.criticalChance;
    if (isCritical) {
      damage *= attacker.criticalDamage;
    }

    return Math.round(damage);
  }
}

module.exports = BattleService;
