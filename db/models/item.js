// models/item.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      Item.hasMany(models.Inventory, { foreignKey: 'itemId' });
      
      // Ассоциации для системы крафта
      Item.hasMany(models.CraftRecipe, { 
        foreignKey: 'resultItemId', 
      });
      Item.hasMany(models.CraftRecipe, { 
        foreignKey: 'materialItemId',  
      });
      
      // Рекурсивная ассоциация для базовых предметов
      Item.belongsTo(models.Item, { 
        foreignKey: 'baseItemId', 
      });
      Item.hasMany(models.Item, { 
        foreignKey: 'baseItemId', 
      });
    }
  }
  Item.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('upgrade', 'consumable', 'special', 'material', 'composite'),
      allowNull: false
    },
    color: {
      type: DataTypes.ENUM('gray', 'green', 'blue', 'orange', 'red'),
      allowNull: false
    },
    requiredRank: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    targetColor: {
      type: DataTypes.ENUM('gray', 'green', 'blue', 'orange', 'red'),
      defaultValue: 'gray'
    },
    targetSlot: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    statBonus: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    dropChance: {
      type: DataTypes.FLOAT,
      defaultValue: 0.1
    },
    energyCost: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    // НОВЫЕ ПОЛЯ ДЛЯ СИСТЕМЫ КРАФТА
    isCraftable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    baseItemId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    compositionLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    craftCost: {
      type: DataTypes.JSON,
      defaultValue: {
        gold: 0,
        crystals: 0,
        energy: 0
      }
    },
    maxStack: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    inheritsStatsFrom: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Item',
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['color']
      },
      {
        fields: ['requiredRank']
      },
      {
        fields: ['isCraftable']
      }
    ]
  });
  return Item;
};
