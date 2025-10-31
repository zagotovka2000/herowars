'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4 // Убрано autoIncrement, добавлен defaultValue
      },
      telegramId: {
        type: Sequelize.BIGINT
      },
      username: {
        type: Sequelize.STRING
      },
      gameNik: {
        type: Sequelize.STRING
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1 // Добавлено значение по умолчанию
      },
      experience: {
        type: Sequelize.INTEGER,
        defaultValue: 0 // Добавлено значение по умолчанию
      },
      energy: {
        type: Sequelize.INTEGER,
        defaultValue: 100 // Добавлено значение по умолчанию
      },
      maxEnergy: {
        type: Sequelize.INTEGER,
        defaultValue: 100 // Добавлено значение по умолчанию
      },
      lastEnergyUpdate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // Добавлено значение по умолчанию
      },
      gold: {
        type: Sequelize.INTEGER,
        defaultValue: 0 // Добавлено значение по умолчанию
      },
      crystals: {
        type: Sequelize.INTEGER,
        defaultValue: 0 // Добавлено значение по умолчанию
      },
      guildId: {
        type: Sequelize.UUID
      },
      rank: {
        type: Sequelize.ENUM('novice', 'warrior', 'champion', 'master', 'legend'),
        defaultValue: 'novice' // Добавлено значение по умолчанию
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
