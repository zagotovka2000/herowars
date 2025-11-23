// models/craftrecipe.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CraftRecipe extends Model {
    static associate(models) {
      CraftRecipe.belongsTo(models.Item, { 
        foreignKey: 'resultItemId',
      });
      CraftRecipe.belongsTo(models.Item, { 
        foreignKey: 'materialItemId',
      });
    }
  }
  CraftRecipe.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    resultItemId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    materialItemId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'CraftRecipe',
    tableName: 'CraftRecipes',
    indexes: [
      {
        fields: ['resultItemId']
      },
      {
        fields: ['materialItemId']
      },
      {
        fields: ['resultItemId', 'materialItemId'],
        unique: true
      }
    ]
  });
  return CraftRecipe;
};
