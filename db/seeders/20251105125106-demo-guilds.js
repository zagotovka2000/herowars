'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем пользователей через прямой SQL запрос
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" ORDER BY "createdAt" LIMIT 3;'
    );

    if (!users || users.length === 0) {
      throw new Error('No users found. Please run user seeds first.');
    }

    console.log('Found users:', users);

    const guilds = [
      {
        id: uuidv4(),
        name: 'Dragon Slayers',
        tag: 'DRGN',
        description: 'Элитная гильдия охотников на драконов',
        level: 15,
        experience: 125000,
        membersCount: 28,
        maxMembers: 30,
        leaderId: users[0].id,
        trophy: 45000,
        requiredTrophy: 2000,
        isOpen: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mage Council',
        tag: 'MAGE',
        description: 'Совет магов, изучающих древние искусства',
        level: 12,
        experience: 98000,
        membersCount: 25,
        maxMembers: 30,
        leaderId: users[1].id,
        trophy: 38000,
        requiredTrophy: 1800,
        isOpen: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Rookie Alliance',
        tag: 'ROOK',
        description: 'Гильдия для новичков',
        level: 5,
        experience: 15000,
        membersCount: 15,
        maxMembers: 25,
        leaderId: users[2].id,
        trophy: 12000,
        requiredTrophy: 300,
        isOpen: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Guilds', guilds, {});

    // Обновляем пользователей с guildId
    for (const guild of guilds) {
      await queryInterface.sequelize.query(
        `UPDATE "Users" SET "guildId" = '${guild.id}' WHERE id = '${guild.leaderId}'`
      );
    }

    console.log('Guilds created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Сначала обнуляем guildId у пользователей
    await queryInterface.sequelize.query('UPDATE "Users" SET "guildId" = NULL');
    await queryInterface.bulkDelete('Guilds', null, {});
  }
};
