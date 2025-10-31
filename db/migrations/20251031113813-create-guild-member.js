'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GuildMembers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      guildId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('leader', 'officer', 'member', 'recruit'),
        defaultValue: 'member'
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      contribution: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastDonation: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Добавляем внешние ключи
    await queryInterface.addConstraint('GuildMembers', {
      fields: ['guildId'],
      type: 'foreign key',
      name: 'fk_guildmember_guild',
      references: {
        table: 'Guilds',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('GuildMembers', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_guildmember_user',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Уникальный индекс для пары guild-user
    await queryInterface.addIndex('GuildMembers', {
      fields: ['guildId', 'userId'],
      unique: true,
      name: 'guildmember_guild_user_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('GuildMembers', 'fk_guildmember_guild');
    await queryInterface.removeConstraint('GuildMembers', 'fk_guildmember_user');
    await queryInterface.removeIndex('GuildMembers', 'guildmember_guild_user_unique');
    await queryInterface.dropTable('GuildMembers');
  }
};
