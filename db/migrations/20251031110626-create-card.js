'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cards', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      color: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'orange', 'red'),
        defaultValue: 'gray'
      },
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      baseAttack: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      baseHealth: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      baseArmor: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      baseCriticalChance: {
        type: Sequelize.FLOAT,
        defaultValue: 0.05
      },
      currentHealth: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      maxHealth: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      superMeter: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      currentSuperMeter: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      superAttackMultiplier: {
        type: Sequelize.FLOAT,
        defaultValue: 1.5
      },
      baseSuperMultiplier: {
        type: Sequelize.FLOAT,
        defaultValue: 1.5
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      experience: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isInDeck: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      slotPosition: {
        type: Sequelize.INTEGER
      },
      equippedItems: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      abilities: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      battleStats: {
        type: Sequelize.JSON,
        defaultValue: {
          battles: 0,
          wins: 0,
          losses: 0,
          superAttacks: 0,
          totalDamage: 0,
          totalHealing: 0
        }
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

    // Добавляем индексы для производительности
    await queryInterface.addIndex('Cards', ['userId']);
    await queryInterface.addIndex('Cards', ['color']);
    await queryInterface.addIndex('Cards', ['isInDeck']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Cards');
  }
};
