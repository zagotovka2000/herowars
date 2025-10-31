'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmingLocation extends Model {
    static associate(models) {
      FarmingLocation.hasMany(models.FarmingSession, { foreignKey: 'locationId' });
    }
  }
  FarmingLocation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    requiredLevel: DataTypes.INTEGER,
    energyCost: DataTypes.INTEGER,
    minRewardTier: DataTypes.INTEGER,
    maxRewardTier: DataTypes.INTEGER,
    itemPool: DataTypes.JSON,
    cooldown: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FarmingLocation',
  });
  return FarmingLocation;
};
