'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем гильдии и пользователей с правильными именами таблиц
    const [guilds, users] = await Promise.all([
      queryInterface.sequelize.query(
        'SELECT id, "leaderId" FROM "Guilds";',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        'SELECT id FROM "Users";',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ]);

    if (!guilds || guilds.length === 0) {
      throw new Error('No guilds found. Please run guild seeds first.');
    }

    if (!users || users.length === 0) {
      throw new Error('No users found. Please run user seeds first.');
    }

    const members = [];

    // Для каждой гильдии добавляем несколько участников
    guilds.forEach((guild) => {
      // Лидер уже есть в гильдии, добавляем офицеров и членов
      const availableUsers = users.filter(user => user.id !== guild.leaderId);
      
      // Добавляем офицера (если есть доступные пользователи)
      if (availableUsers.length > 0) {
        members.push({
          id: uuidv4(),
          guildId: guild.id,
          userId: availableUsers[0].id,
          role: 'officer',
          joinedAt: new Date(),
          contribution: 1500,
          lastDonation: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Добавляем обычных членов (2-3 человека)
      for (let i = 1; i <= Math.min(3, availableUsers.length - 1); i++) {
        members.push({
          id: uuidv4(),
          guildId: guild.id,
          userId: availableUsers[i].id,
          role: i === 1 ? 'member' : 'recruit',
          joinedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // разные даты вступления
          contribution: 500 + i * 200,
          lastDonation: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    if (members.length > 0) {
      await queryInterface.bulkInsert('GuildMembers', members, {});
      console.log(`Created ${members.length} guild members`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('GuildMembers', null, {});
  }
};
