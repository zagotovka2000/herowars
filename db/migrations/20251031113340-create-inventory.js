'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inventories', {
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
      itemId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
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

    // Добавляем внешние ключи
    await queryInterface.addConstraint('Inventories', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_inventory_user',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Inventories', {
      fields: ['itemId'],
      type: 'foreign key',
      name: 'fk_inventory_item',
      references: {
        table: 'Items',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Добавляем уникальный индекс для пары user-item
    await queryInterface.addIndex('Inventories', {
      fields: ['userId', 'itemId'],
      unique: true,
      name: 'inventory_user_item_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Inventories', 'fk_inventory_user');
    await queryInterface.removeConstraint('Inventories', 'fk_inventory_item');
    await queryInterface.removeIndex('Inventories', 'inventory_user_item_unique');
    await queryInterface.dropTable('Inventories');
  }
};
