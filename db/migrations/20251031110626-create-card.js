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
        allowNull: false
      },
      name: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'orange', 'red')
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
      superMeter: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      superAttackMultiplier: {
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
        type: Sequelize.JSON
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

    // Добавляем внешний ключ
    await queryInterface.addConstraint('Cards', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_card_user',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Cards', 'fk_card_user');
    await queryInterface.dropTable('Cards');
  }
};
