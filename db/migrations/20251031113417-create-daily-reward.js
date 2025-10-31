'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DailyRewards', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      rewardType: {
        type: Sequelize.ENUM('gray_card', 'green_card', 'blue_card', 'energy', 'gold', 'crystals')
      },
      claimedAt: {
        type: Sequelize.DATE
      },
      nextAvailableAt: {
        type: Sequelize.DATE
      },
      streak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addConstraint('DailyRewards', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_dailyreward_user',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('DailyRewards', 'fk_dailyreward_user');
    await queryInterface.dropTable('DailyRewards');
  }
};
