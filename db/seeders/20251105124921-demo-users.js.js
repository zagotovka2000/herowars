'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        telegramId: 123456789,
        username: 'test_user',
        gameNik: 'HeroWarrior',
        level: 15,
        experience: 12500,
        energy: 120,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        gold: 50000,
        crystals: 1500,
        guildId: null,
        rank: JSON.stringify({ rank: 5, stars: 3, points: 1250 }),
        trophy: 2450,
        arenaRating: 1800,
        campaignProgress: JSON.stringify({ currentCampaign: 1, currentLevel: 12 }),
        dailyQuestsRefresh: new Date(),
        freeChestAvailableAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        telegramId: 987654321,
        username: 'mage_player',
        gameNik: 'DarkMage',
        level: 22,
        experience: 32000,
        energy: 90,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        gold: 120000,
        crystals: 3200,
        guildId: null,
        rank: JSON.stringify({ rank: 8, stars: 1, points: 2100 }),
        trophy: 3100,
        arenaRating: 2450,
        campaignProgress: JSON.stringify({ currentCampaign: 2, currentLevel: 8 }),
        dailyQuestsRefresh: new Date(),
        freeChestAvailableAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        telegramId: 555555555,
        username: 'new_player',
        gameNik: 'Rookie',
        level: 5,
        experience: 1500,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        gold: 5000,
        crystals: 200,
        guildId: null,
        rank: JSON.stringify({ rank: 1, stars: 0, points: 100 }),
        trophy: 450,
        arenaRating: 600,
        campaignProgress: JSON.stringify({ currentCampaign: 1, currentLevel: 3 }),
        dailyQuestsRefresh: new Date(),
        freeChestAvailableAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
