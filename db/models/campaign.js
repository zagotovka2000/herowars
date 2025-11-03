'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Campaign.hasMany(models.CampaignLevel, { foreignKey: 'campaignId' });
      Campaign.hasMany(models.CampaignProgress, { foreignKey: 'campaignId' });    }
  }
  Campaign.init({
   name: DataTypes.STRING,
   description: DataTypes.TEXT,
   requiredLevel: DataTypes.INTEGER,
   imageUrl: DataTypes.STRING,
   isActive: DataTypes.BOOLEAN,
   order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Campaign',
  });
  return Campaign;
};
