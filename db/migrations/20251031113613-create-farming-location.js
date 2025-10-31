'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FarmingLocations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING
      },
      requiredLevel: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      energyCost: {
        type: Sequelize.INTEGER
      },
      minRewardTier: {
        type: Sequelize.INTEGER
      },
      maxRewardTier: {
        type: Sequelize.INTEGER
      },
      itemPool: {
        type: Sequelize.JSON
      },
      cooldown: {
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
    await queryInterface.dropTable('FarmingLocations');
  }
};
