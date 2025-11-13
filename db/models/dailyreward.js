'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyReward extends Model {
    static associate(models) {
      DailyReward.belongsTo(models.User, { 
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  DailyReward.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    rewardType: {
      type: DataTypes.ENUM('gray', 'green', 'blue', 'energy', 'gold', 'crystals'),
      allowNull: false
    },
    lastClaimedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextAvailableAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    claimCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'DailyReward',
    tableName: 'daily_rewards',
    indexes: [
      {
        fields: ['userId', 'rewardType']
      }
    ]
  });
  return DailyReward;
};
