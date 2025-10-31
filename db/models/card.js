'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    static associate(models) {
      Card.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Card.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    name: DataTypes.STRING,
    color: DataTypes.ENUM('gray', 'green', 'blue', 'orange', 'red'),
    rank: DataTypes.INTEGER,
    baseAttack: DataTypes.INTEGER,
    baseHealth: DataTypes.INTEGER,
    baseArmor: DataTypes.INTEGER,
    baseCriticalChance: DataTypes.FLOAT,
    currentHealth: DataTypes.INTEGER,
    superMeter: DataTypes.INTEGER,
    superAttackMultiplier: DataTypes.FLOAT,
    level: DataTypes.INTEGER,
    experience: DataTypes.INTEGER,
    isInDeck: DataTypes.BOOLEAN,
    slotPosition: DataTypes.INTEGER,
    equippedItems: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Card',
  });
  return Card;
};
