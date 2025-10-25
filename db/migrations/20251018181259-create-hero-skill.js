'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HeroSkills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      damage: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      heal: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      effect: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      cooldown: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      manaCost: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      skillType: {
        type: Sequelize.ENUM('attack', 'heal', 'buff', 'debuff'),
        defaultValue: 'attack'
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

    await queryInterface.addColumn('Battles', 'battleState', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('Battles', 'animationLog', {
      type: Sequelize.JSONB,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HeroSkills');
    await queryInterface.removeColumn('Battles', 'battleState');
    await queryInterface.removeColumn('Battles', 'animationLog');
  }
};
