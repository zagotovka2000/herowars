'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CampaignProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CampaignProgress.belongsTo(models.User, { foreignKey: 'userId' });
      CampaignProgress.belongsTo(models.Campaign, { foreignKey: 'campaignId' });
      CampaignProgress.belongsTo(models.CampaignLevel, { foreignKey: 'levelId' });    }
  }
  CampaignProgress.init({
   userId: DataTypes.UUID,
   campaignId: DataTypes.UUID,
   levelId: DataTypes.UUID,
   completed: DataTypes.BOOLEAN,
   stars: DataTypes.INTEGER, // 1-3 звезды за прохождение
   bestScore: DataTypes.INTEGER,
   attempts: DataTypes.INTEGER,
   completedAt: DataTypes.DATE  }, {
    sequelize,
    modelName: 'CampaignProgress',
  });
  return CampaignProgress;
};
