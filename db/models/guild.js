'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    static associate(models) {
      Guild.hasMany(models.User, { foreignKey: 'guildId' });
      Guild.hasMany(models.GuildMember, { foreignKey: 'guildId' });
      Guild.hasMany(models.Battle, { foreignKey: 'guild1Id' });
      Guild.hasMany(models.Battle, { foreignKey: 'guild2Id' });
    }
  }
  Guild.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    tag: DataTypes.STRING,
    description: DataTypes.TEXT,
    level: DataTypes.INTEGER,
    experience: DataTypes.INTEGER,
    membersCount: DataTypes.INTEGER,
    maxMembers: DataTypes.INTEGER,
    leaderId: DataTypes.UUID,
    trophy: DataTypes.INTEGER,
    requiredTrophy: DataTypes.INTEGER,
    isOpen: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Guild',
  });
  return Guild;
};
