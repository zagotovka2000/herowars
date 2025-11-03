'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CampaignLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CampaignLevel.belongsTo(models.Campaign, { foreignKey: 'campaignId' });
      CampaignLevel.hasMany(models.CampaignProgress, { foreignKey: 'levelId' });    }
  }
  CampaignLevel.init({
   campaignId: DataTypes.UUID,
   name: DataTypes.STRING,
   description: DataTypes.TEXT,
   levelNumber: DataTypes.INTEGER,
   energyCost: DataTypes.INTEGER,
   goldReward: DataTypes.INTEGER,
   expReward: DataTypes.INTEGER,
   itemRewards: DataTypes.JSON, // [{itemId, quantity, chance}]
   enemyDeck: DataTypes.JSON, // Конфигурация колоды противника
   requiredPower: DataTypes.INTEGER,
   imageUrl: DataTypes.STRING,
   isBossLevel: DataTypes.BOOLEAN  }, {
    sequelize,
    modelName: 'CampaignLevel',
  });
  return CampaignLevel;
};
