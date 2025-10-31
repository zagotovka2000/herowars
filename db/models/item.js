'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      Item.hasMany(models.Inventory, { foreignKey: 'itemId' });
    }
  }
  Item.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    type: DataTypes.ENUM('upgrade', 'consumable', 'special'),
    color: DataTypes.ENUM('gray', 'green', 'blue', 'orange', 'red'),
    requiredRank: DataTypes.INTEGER,
    targetColor: DataTypes.ENUM('gray', 'green', 'blue', 'orange', 'red'),
    targetSlot: DataTypes.INTEGER,
    statBonus: DataTypes.JSON,
    dropChance: DataTypes.FLOAT,
    energyCost: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};
