'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Battle extends Model {
    static associate(models) {
      Battle.belongsTo(models.User, { as: 'Player1', foreignKey: 'player1Id' });
      Battle.belongsTo(models.User, { as: 'Player2', foreignKey: 'player2Id' });
      Battle.belongsTo(models.User, { as: 'Winner', foreignKey: 'winnerId' });
    }
  }
  Battle.init({
    battleLog: DataTypes.TEXT,
    winnerId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending'
    },
    player1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    player2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Battle',
  });
  return Battle;
};
