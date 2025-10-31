'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('upgrade', 'consumable', 'special')
      },
      color: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'orange', 'red')
      },
      requiredRank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      targetColor: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'orange', 'red')
      },
      targetSlot: {
        type: Sequelize.INTEGER
      },
      statBonus: {
        type: Sequelize.JSON
      },
      dropChance: {
        type: Sequelize.FLOAT
      },
      energyCost: {
        type: Sequelize.INTEGER
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Items');
  }
};
