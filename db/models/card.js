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
    equippedItems: DataTypes.JSON,
    maxHealth: DataTypes.INTEGER, // Максимальное здоровье (отсутствует)
    currentSuperMeter: DataTypes.INTEGER, // Текущая шкала супер удара (0-100)
    baseSuperMultiplier: DataTypes.FLOAT, // Базовый множитель супер атаки
    abilities: DataTypes.JSON, // Способности карты
    battleStats: DataTypes.JSON, // {battles: 0, wins: 0, superAttacks: 0}
  }, {
    sequelize,
    modelName: 'Card',
  });
  return Card;
};
