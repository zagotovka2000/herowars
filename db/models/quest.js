'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Quest.hasMany(models.QuestProgress, { foreignKey: 'questId' });
    }
  }
  Quest.init({
   title: DataTypes.STRING,
   description: DataTypes.TEXT,
   type: DataTypes.ENUM('daily', 'weekly', 'achievement'),
   objective: DataTypes.JSON, // {type: 'win_battles', target: 5}
   reward: DataTypes.JSON, // {gold: 100, exp: 50, items: []}
   requiredLevel: DataTypes.INTEGER,
   isActive: DataTypes.BOOLEAN,
   expiresAt: DataTypes.DATE  }, {
    sequelize,
    modelName: 'Quest',
  });
  return Quest;
};
