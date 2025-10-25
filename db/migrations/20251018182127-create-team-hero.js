'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TeamHeroes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      heroId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Heroes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.INTEGER,
        comment: 'Position in team (1-5)'
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

    await queryInterface.addIndex('TeamHeroes', ['teamId', 'heroId'], {
      unique: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TeamHeroes');
  }
};
