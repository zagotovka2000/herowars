// migrations/XXXXXX-create-items.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('upgrade', 'consumable', 'special', 'material', 'composite'),
        allowNull: false
      },
      color: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'orange', 'red'),
        allowNull: false
      },
      requiredRank: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      targetColor: {
        type: Sequelize.ENUM('gray', 'green', 'blue', 'orange', 'red'),
        defaultValue: 'gray'
      },
      targetSlot: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      statBonus: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      dropChance: {
        type: Sequelize.FLOAT,
        defaultValue: 0.1
      },
      energyCost: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      // ДОБАВЛЕННЫЕ ПОЛЯ ДЛЯ СИСТЕМЫ КРАФТА
      isCraftable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      baseItemId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Items',
          key: 'id'
        }
      },
      compositionLevel: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      craftCost: {
        type: Sequelize.JSON,
        defaultValue: {
          gold: 0,
          crystals: 0,
          energy: 0
        }
      },
      maxStack: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      inheritsStatsFrom: {
        type: Sequelize.JSON,
        defaultValue: []
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

    // Индексы для улучшения производительности
    await queryInterface.addIndex('Items', ['type']);
    await queryInterface.addIndex('Items', ['color']);
    await queryInterface.addIndex('Items', ['requiredRank']);
    await queryInterface.addIndex('Items', ['isCraftable']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Items');
  }
};
