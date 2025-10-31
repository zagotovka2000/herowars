'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем внешний ключ для guildId
    await queryInterface.addConstraint('Users', {
      fields: ['guildId'],
      type: 'foreign key',
      name: 'fk_user_guild',
      references: {
        table: 'Guilds',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Users', 'fk_user_guild');
  }
};
