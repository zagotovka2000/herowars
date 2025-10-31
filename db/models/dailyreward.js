'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyReward extends Model {
    static associate(models) {
      DailyReward.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  DailyReward.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    rewardType: DataTypes.ENUM('gray_card', 'green_card', 'blue_card', 'energy', 'gold', 'crystals'),
    claimedAt: DataTypes.DATE,
    nextAvailableAt: DataTypes.DATE,
    streak: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DailyReward',
  });
  return DailyReward;
};
