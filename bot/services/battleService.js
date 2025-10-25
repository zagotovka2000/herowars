const { Op } = require('sequelize');

class BattleService {
  constructor(models) {
    this.models = models;
  }

  async generateWebGLBattleData(playerTeam, enemyTeam) {
    const playerHeroes = playerTeam.Heroes.map(hero => this._formatHeroForWebGL(hero, 'player'));
    const enemyHeroes = enemyTeam.Heroes.map(hero => this._formatHeroForWebGL(hero, 'enemy'));

    return {
      playerHeroes,
      enemyHeroes,
      terrain: this._generateTerrain(),
      effects: [],
      turn: 0,
      battleState: 'ready'
    };
  }

  _formatHeroForWebGL(hero, team) {
    return {
      id: hero.id,
      name: hero.name,
      team: team,
      level: hero.level,
      health: hero.health,
      maxHealth: hero.health,
      mana: hero.mana || 100,
      maxMana: hero.maxMana || 100,
      attack: hero.attack,
      defense: hero.defense,
      speed: hero.speed,
      criticalChance: hero.criticalChance,
      criticalDamage: hero.criticalDamage,
      position: this._getBattlePosition(hero.TeamHero ? hero.TeamHero.position : 1, team),
      skills: hero.HeroSkills || [],
      statusEffects: [],
      isAlive: true
    };
  }

  _getBattlePosition(teamPosition, team) {
    const positions = {
      player: [
        { x: 100, y: 150 }, { x: 100, y: 250 }, { x: 100, y: 350 },
        { x: 100, y: 450 }, { x: 100, y: 550 }
      ],
      enemy: [
        { x: 700, y: 150 }, { x: 700, y: 250 }, { x: 700, y: 350 },
        { x: 700, y: 450 }, { x: 700, y: 550 }
      ]
    };

    const index = (teamPosition - 1) || 0;
    return positions[team][index] || positions[team][0];
  }

  _generateTerrain() {
    return {
      type: 'arena',
      background: 'battle_arena_1',
      obstacles: []
    };
  }

  async simulateBattleTurn(battleId, action) {
    const battle = await this.models.Battle.findByPk(battleId);
    if (!battle) throw new Error('Battle not found');

    const battleState = battle.battleState || await this._initializeBattleState(battle);
    
    const turnResult = this._calculateTurn(battleState, action);
    
    await battle.update({
      battleState: turnResult.newState,
      animationLog: [...(battle.animationLog || []), turnResult.animation]
    });

    return turnResult;
  }

  _calculateTurn(battleState, action) {
    const { actorId, targetId, skillId } = action;
    
    const actor = [...battleState.playerHeroes, ...battleState.enemyHeroes]
      .find(h => h.id === actorId);
    const target = [...battleState.playerHeroes, ...battleState.enemyHeroes]
      .find(h => h.id === targetId);

    if (!actor || !target || !actor.isAlive) {
      throw new Error('Invalid action');
    }

    const skill = actor.skills.find(s => s.id === skillId) || this._getBasicAttack();
    const result = this._calculateSkillEffect(actor, target, skill);

    const animation = {
      type: skill.skillType,
      actorId: actor.id,
      targetId: target.id,
      skill: skill.name,
      damage: result.damage,
      heal: result.heal,
      isCritical: result.isCritical,
      effects: result.effects,
      timestamp: Date.now()
    };

    const newState = this._updateBattleState(battleState, actor, target, result, skill);

    return {
      animation,
      newState,
      battleFinished: this._checkBattleEnd(newState)
    };
  }

  _calculateSkillEffect(actor, target, skill) {
    let damage = 0;
    let heal = 0;
    const isCritical = Math.random() < actor.criticalChance;
    const critMultiplier = isCritical ? actor.criticalDamage : 1;

    if (skill.skillType === 'attack') {
      damage = Math.max(1, Math.floor(
        (actor.attack + skill.damage) * critMultiplier - target.defense * 0.5
      ));
    } else if (skill.skillType === 'heal') {
      heal = skill.heal + (actor.attack * 0.2);
    }

    return {
      damage,
      heal,
      isCritical,
      effects: skill.effect || {}
    };
  }

  _updateBattleState(state, actor, target, result, skill) {
    const newState = JSON.parse(JSON.stringify(state));
    
    const allHeroes = [...newState.playerHeroes, ...newState.enemyHeroes];
    const updatedTarget = allHeroes.find(h => h.id === target.id);
    
    if (updatedTarget) {
      updatedTarget.health = Math.max(0, updatedTarget.health - result.damage);
      updatedTarget.health = Math.min(updatedTarget.maxHealth, updatedTarget.health + result.heal);
      updatedTarget.isAlive = updatedTarget.health > 0;
      
      if (Object.keys(result.effects).length > 0) {
        updatedTarget.statusEffects.push({
          ...result.effects,
          duration: result.effects.duration || 3
        });
      }
    }

    const updatedActor = allHeroes.find(h => h.id === actor.id);
    if (updatedActor && skill.manaCost) {
      updatedActor.mana = Math.max(0, updatedActor.mana - skill.manaCost);
    }

    newState.turn++;
    return newState;
  }

  _getBasicAttack() {
    return {
      id: 0,
      name: 'Basic Attack',
      skillType: 'attack',
      damage: 0,
      manaCost: 0
    };
  }

  _checkBattleEnd(state) {
    const playerAlive = state.playerHeroes.some(h => h.isAlive);
    const enemyAlive = state.enemyHeroes.some(h => h.isAlive);
    
    if (!playerAlive || !enemyAlive) {
      return {
        winner: playerAlive ? 'player' : 'enemy',
        reason: !playerAlive ? 'player_team_defeated' : 'enemy_team_defeated'
      };
    }
    return null;
  }

  async _initializeBattleState(battle) {
    const playerTeam = await this.models.Team.findOne({
      where: { userId: battle.player1Id },
      include: [{ 
        model: this.models.Hero,
        include: [this.models.HeroSkill]
      }]
    });

    const enemyTeam = await this.models.Team.findOne({
      where: { userId: battle.player2Id },
      include: [{ 
        model: this.models.Hero,
        include: [this.models.HeroSkill]
      }]
    });

    return await this.generateWebGLBattleData(playerTeam, enemyTeam);
  }
}

module.exports = BattleService;
