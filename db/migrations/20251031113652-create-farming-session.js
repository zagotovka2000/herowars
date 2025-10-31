'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FarmingSessions', {
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
      locationId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      energySpent: {
        type: Sequelize.INTEGER
      },
      rewards: {
        type: Sequelize.JSON
      },
      startedAt: {
        type: Sequelize.DATE
      },
      completedAt: {
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

    await queryInterface.addConstraint('FarmingSessions', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_farmingsession_user',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('FarmingSessions', {
      fields: ['locationId'],
      type: 'foreign key',
      name: 'fk_farmingsession_location',
      references: {
        table: 'FarmingLocations',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('FarmingSessions', 'fk_farmingsession_user');
    await queryInterface.removeConstraint('FarmingSessions', 'fk_farmingsession_location');
    await queryInterface.dropTable('FarmingSessions');
  }
};
