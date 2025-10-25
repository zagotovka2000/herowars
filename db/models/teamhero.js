'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TeamHero extends Model {
    static associate(models) {
      TeamHero.belongsTo(models.Team, { foreignKey: 'teamId' });
      TeamHero.belongsTo(models.Hero, { foreignKey: 'heroId' });
    }
  }
  TeamHero.init({
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id'
      }
    },
    heroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Heroes',
        key: 'id'
      }
    },
    position: {
      type: DataTypes.INTEGER,
      comment: 'Position in team (1-5)'
    }
  }, {
    sequelize,
    modelName: 'TeamHero',
    tableName: 'TeamHeroes'
  });
  return TeamHero;
};
