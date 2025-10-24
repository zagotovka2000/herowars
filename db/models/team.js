'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.belongsTo(models.User, { foreignKey: 'userId' });
      Team.belongsToMany(models.Hero, { 
        through: 'TeamHero',
        foreignKey: 'teamId',
        otherKey: 'heroId',
        as: 'Heroes'
      });
    }
  }
  Team.init({
    name: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    modelName: 'Team',
  });
  return Team;
};
