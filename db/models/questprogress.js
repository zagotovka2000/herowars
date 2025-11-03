'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QuestProgress.belongsTo(models.User, { foreignKey: 'userId' });
      QuestProgress.belongsTo(models.Quest, { foreignKey: 'questId' });    }
  }
  QuestProgress.init({
   userId: DataTypes.UUID,
   questId: DataTypes.UUID,
   progress: DataTypes.INTEGER, // Текущий прогресс (например, 3/5 побед)
   completed: DataTypes.BOOLEAN,
   claimed: DataTypes.BOOLEAN,
   completedAt: DataTypes.DATE  }, {
    sequelize,
    modelName: 'QuestProgress',
  });
  return QuestProgress;
};
