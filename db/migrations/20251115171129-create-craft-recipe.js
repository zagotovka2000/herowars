// migrations/XXXXXX-create-craft-recipes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CraftRecipes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      resultItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      materialItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      order: {
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

    // Составные индексы для улучшения производительности
    await queryInterface.addIndex('CraftRecipes', ['resultItemId']);
    await queryInterface.addIndex('CraftRecipes', ['materialItemId']);
    await queryInterface.addIndex('CraftRecipes', ['resultItemId', 'materialItemId'], {
      unique: true,
      name: 'craft_recipes_result_material_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CraftRecipes');
  }
};
