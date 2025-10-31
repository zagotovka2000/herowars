'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GuildMember extends Model {
    static associate(models) {
      GuildMember.belongsTo(models.Guild, { foreignKey: 'guildId' });
      GuildMember.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  GuildMember.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    guildId: DataTypes.UUID,
    userId: DataTypes.UUID,
    role: DataTypes.ENUM('leader', 'officer', 'member', 'recruit'),
    joinedAt: DataTypes.DATE,
    contribution: DataTypes.INTEGER,
    lastDonation: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'GuildMember',
  });
  return GuildMember;
};
