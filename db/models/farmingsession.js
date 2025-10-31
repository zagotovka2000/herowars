'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmingSession extends Model {
    static associate(models) {
      FarmingSession.belongsTo(models.User, { foreignKey: 'userId' });
      FarmingSession.belongsTo(models.FarmingLocation, { foreignKey: 'locationId' });
    }
  }
  FarmingSession.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    locationId: DataTypes.UUID,
    energySpent: DataTypes.INTEGER,
    rewards: DataTypes.JSON,
    startedAt: DataTypes.DATE,
    completedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'FarmingSession',
  });
  return FarmingSession;
};
