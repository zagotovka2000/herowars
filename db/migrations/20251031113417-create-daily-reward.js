'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DailyRewards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rewardType: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'energy', 'gold', 'crystals'),
        allowNull: false
      },
      lastClaimedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nextAvailableAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      claimCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    // Добавляем композитный уникальный индекс
    await queryInterface.addIndex('DailyRewards', ['userId', 'rewardType'], {
      unique: true,
      name: 'daily_rewards_user_reward_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DailyRewards');
  }
};
