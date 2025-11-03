'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Guild, { foreignKey: 'guildId' });
      User.hasOne(models.Guild, { foreignKey: 'leaderId', as: 'GuildLeadership' }); 
      User.hasMany(models.Card, { foreignKey: 'userId' });
      User.hasMany(models.Inventory, { foreignKey: 'userId' });
      User.hasMany(models.DailyReward, { foreignKey: 'userId' });
      User.hasMany(models.FarmingSession, { foreignKey: 'userId' });
      User.hasMany(models.Battle, { foreignKey: 'player1Id' });
      User.hasMany(models.Battle, { foreignKey: 'player2Id' });
      User.hasMany(models.Battle, { foreignKey: 'winnerId' });
      User.hasOne(models.GuildMember, { foreignKey: 'userId' });
   }
  }
  User.init({
    telegramId: DataTypes.BIGINT,
    username: DataTypes.STRING,
    gameNik: DataTypes.STRING,
    level: DataTypes.INTEGER,
    experience: DataTypes.INTEGER,
    energy: DataTypes.INTEGER,
    maxEnergy: DataTypes.INTEGER,
    lastEnergyUpdate: DataTypes.DATE,
    gold: DataTypes.INTEGER,
    crystals: DataTypes.INTEGER,
    guildId: DataTypes.UUID,
    rank: DataTypes.JSON,
    trophy: DataTypes.INTEGER, // Для рейтинга в PvP
    arenaRating: DataTypes.INTEGER,
    campaignProgress: DataTypes.JSON, // Текущий прогресс в кампании
    dailyQuestsRefresh: DataTypes.DATE, // Когда обновляются ежедневные квесты
    freeChestAvailableAt: DataTypes.DATE, // Когда доступен бесплатный сундук
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
