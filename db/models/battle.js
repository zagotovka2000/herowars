'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Battle extends Model {
    static associate(models) {
      Battle.belongsTo(models.User, { foreignKey: 'player1Id' });
      Battle.belongsTo(models.User, { foreignKey: 'player2Id' });
      Battle.belongsTo(models.User, { foreignKey: 'winnerId' });
      Battle.belongsTo(models.Guild, { foreignKey: 'guild1Id' });
      Battle.belongsTo(models.Guild, { foreignKey: 'guild2Id' });
    }
  }
  Battle.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: DataTypes.ENUM('pvp', 'guild_war', 'training'),
    player1Id: DataTypes.UUID,
    player2Id: DataTypes.UUID,
    guild1Id: DataTypes.UUID,
    guild2Id: DataTypes.UUID,
    winnerId: DataTypes.UUID,
    status: DataTypes.ENUM('pending', 'in_progress', 'finished', 'cancelled'),
    player1Deck: DataTypes.JSON,
    player2Deck: DataTypes.JSON,
    battleLog: DataTypes.JSON,
    turnsCount: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    trophyChange: DataTypes.INTEGER,
    finishedAt: DataTypes.DATE,
    battleType: DataTypes.ENUM('pvp', 'guild_war', 'campaign', 'training'), // Расширенный тип
    campaignLevelId: DataTypes.UUID, // Для битв в кампании
    player1DeckSnapshot: DataTypes.JSON, // Снимок колоды на начало боя
    player2DeckSnapshot: DataTypes.JSON,
    turns: DataTypes.JSON, // Подробная история ходов
    superAttackUsage: DataTypes.JSON, // Использование супер атак
    rewards: DataTypes.JSON, // Награды за бой
  }, {
    sequelize,
    modelName: 'Battle',
  });
  return Battle;
};
