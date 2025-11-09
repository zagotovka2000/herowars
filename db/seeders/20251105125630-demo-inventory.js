'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем пользователей и предметы с правильными именами таблиц
    const [users, items] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT id FROM "Users";',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT id FROM "Items";',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    if (!users || users.length === 0) {
      throw new Error('No users found. Please run user seeds first.');
    }

    if (!items || items.length === 0) {
      throw new Error('No items found. Please run item seeds first.');
    }

    const inventory = [];

    // Каждому пользователю даем случайные предметы
    users.forEach(user => {
      // 3-5 случайных предметов для каждого пользователя
      const itemCount = 3 + Math.floor(Math.random() * 3);
      const userItems = [...items].sort(() => 0.5 - Math.random()).slice(0, itemCount);
      
      userItems.forEach((item) => {
        inventory.push({
          id: uuidv4(),
          userId: user.id,
          itemId: item.id,
          quantity: 1 + Math.floor(Math.random() * 5),
          // Убрано поле equipped, так как его нет в таблице
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    if (inventory.length > 0) {
      await queryInterface.bulkInsert('Inventories', inventory, {});
      console.log(`Created ${inventory.length} inventory items`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Inventories', null, {});
  }
};
