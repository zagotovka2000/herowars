'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hero extends Model {
    static associate(models) {
      Hero.belongsTo(models.User, { foreignKey: 'userId' });
      Hero.belongsToMany(models.Team, { 
        through: 'TeamHero',
        foreignKey: 'heroId',
        otherKey: 'teamId'
      });
      Hero.hasMany(models.HeroSkill, { 
        foreignKey: 'heroId'
      });
    }
  }
  Hero.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    health: DataTypes.INTEGER,
    attack: DataTypes.INTEGER,
    defense: DataTypes.INTEGER,
    speed: DataTypes.INTEGER,
    criticalChance: DataTypes.FLOAT,
    criticalDamage: DataTypes.FLOAT,
    heroClass: DataTypes.STRING,
    rarity: DataTypes.STRING,
    mana: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    maxMana: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Hero',
  });
  return Hero;
};
