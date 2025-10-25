'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HeroSkill extends Model {
    static associate(models) {
      HeroSkill.belongsTo(models.Hero, { foreignKey: 'heroId' });
    }
  }
  HeroSkill.init({
    heroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Heroes',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    damage: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    heal: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    effect: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    cooldown: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    manaCost: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    skillType: {
      type: DataTypes.ENUM('attack', 'heal', 'buff', 'debuff'),
      defaultValue: 'attack'
    }
  }, {
    sequelize,
    modelName: 'HeroSkill',
  });
  return HeroSkill;
};
