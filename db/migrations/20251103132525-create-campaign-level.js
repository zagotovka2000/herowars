'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CampaignLevels', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      campaignId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Campaigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      levelNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      energyCost: {
        type: Sequelize.INTEGER,
        defaultValue: 6
      },
      goldReward: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      expReward: {
        type: Sequelize.INTEGER,
        defaultValue: 25
      },
      itemRewards: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      enemyDeck: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      requiredPower: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      isBossLevel: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Добавляем индекс для быстрого поиска по campaignId
    await queryInterface.addIndex('CampaignLevels', ['campaignId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CampaignLevels');
  }
};
