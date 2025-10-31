'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Guilds', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING
      },
      tag: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      experience: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      membersCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      maxMembers: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      },
      leaderId: {
        type: Sequelize.UUID 
      },
      trophy: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      requiredTrophy: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isOpen: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Guilds');
  }
};
