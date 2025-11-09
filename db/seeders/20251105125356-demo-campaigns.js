'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const campaigns = [
      {
        id: uuidv4(),
        name: 'Лесные тропы',
        description: 'Начните свое приключение в загадочных лесах',
        requiredLevel: 1,
        imageUrl: '/images/campaigns/forest_trails.jpg',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Горные пики',
        description: 'Покорите заснеженные вершины гор',
        requiredLevel: 10,
        imageUrl: '/images/campaigns/mountain_peaks.jpg',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Пустоши драконов',
        description: 'Сразитесь с древними драконами в выжженных землях',
        requiredLevel: 20,
        imageUrl: '/images/campaigns/dragon_wastelands.jpg',
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Campaigns', campaigns, {});

    // Получаем ID созданных кампаний для создания уровней
    const createdCampaigns = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Campaigns" ORDER BY "order";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    return createdCampaigns;
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Campaigns', null, {});
  }
};
