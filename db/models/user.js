'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Hero, { foreignKey: 'userId' });
      User.hasMany(models.Team, { foreignKey: 'userId' });
      User.hasMany(models.Battle, { foreignKey: 'player1Id' });
      User.hasMany(models.Battle, { foreignKey: 'player2Id' });
      User.hasMany(models.Battle, { foreignKey: 'winnerId' });
    }
  }
  User.init({
    telegramId: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false
    },
    username: DataTypes.STRING,
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    gold: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    },
    gems: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    lastBattleAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
