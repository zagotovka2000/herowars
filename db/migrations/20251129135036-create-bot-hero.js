// migrations/XXXXXX-create-bot-heroes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BotHeroes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      totalPower: {
        type: Sequelize.INTEGER
      },
      wins: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      losses: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      arenaRank: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('orc', 'goblin', 'knight', 'mage', 'archer', 'warrior', 'assassin')
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard', 'expert')
      },
      rewardGold: {
        type: Sequelize.INTEGER
      },
      rewardExp: {
        type: Sequelize.INTEGER
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

    // Добавляем индексы для часто используемых полей
    await queryInterface.addIndex('BotHeroes', ['type']);
    await queryInterface.addIndex('BotHeroes', ['difficulty']);
    await queryInterface.addIndex('BotHeroes', ['arenaRank']);
    await queryInterface.addIndex('BotHeroes', ['level']);
    await queryInterface.addIndex('BotHeroes', ['rank']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BotHeroes');
  }
};
