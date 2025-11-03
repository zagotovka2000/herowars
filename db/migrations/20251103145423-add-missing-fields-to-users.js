'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала добавляем новые поля
    await queryInterface.addColumn('Users', 'trophy', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('Users', 'arenaRating', {
      type: Sequelize.INTEGER,
      defaultValue: 1000
    });
    
    await queryInterface.addColumn('Users', 'campaignProgress', {
      type: Sequelize.JSON,
      defaultValue: {
        currentLevel: 1,
        completedLevels: [1],
        totalStars: 0
      }
    });
    
    await queryInterface.addColumn('Users', 'dailyQuestsRefresh', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('Users', 'freeChestAvailableAt', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    // Вместо изменения типа rank, создадим новое поле rankJson
    await queryInterface.addColumn('Users', 'rankJson', {
      type: Sequelize.JSON,
      defaultValue: {
        name: 'novice',
        power: 0
      }
    });

    // Обновим существующие записи: скопируем данные из rank в rankJson
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET "rankJson" = json_build_object('name', "rank", 'power', 0)
    `);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем добавленные колонки
    await queryInterface.removeColumn('Users', 'trophy');
    await queryInterface.removeColumn('Users', 'arenaRating');
    await queryInterface.removeColumn('Users', 'campaignProgress');
    await queryInterface.removeColumn('Users', 'dailyQuestsRefresh');
    await queryInterface.removeColumn('Users', 'freeChestAvailableAt');
    await queryInterface.removeColumn('Users', 'rankJson');
  }
};
