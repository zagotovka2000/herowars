'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем кампании, отсортированные по дате создания (порядок вставки)
    const [campaigns] = await queryInterface.sequelize.query(
      'SELECT id FROM "Campaigns" ORDER BY "createdAt";'
    );

    const levels = [];

    // Уровни для первой кампании (1-10)
    for (let i = 1; i <= 10; i++) {
      levels.push({
        id: uuidv4(),
        campaignId: campaigns[0].id,
        name: `Лесной уровень ${i}`,
        description: `Исследуйте глубины леса на уровне ${i}`,
        levelNumber: i,
        energyCost: 5 + i,
        goldReward: 100 * i,
        expReward: 50 * i,
        itemRewards: JSON.stringify([
          { itemId: 'health_potion', quantity: 1, chance: 0.5 },
          { itemId: 'basic_sword', quantity: 1, chance: 0.1 }
        ]),
        enemyDeck: JSON.stringify({
          enemies: [
            { type: 'goblin', level: i, count: 2 + i },
            { type: 'wolf', level: i, count: 1 + Math.floor(i / 3) }
          ],
          boss: i === 10 ? 'forest_guardian' : null
        }),
        requiredPower: 100 * i,
        imageUrl: `/images/levels/forest_${i}.jpg`,
        isBossLevel: i === 10,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Уровни для второй кампании (11-20)
    for (let i = 1; i <= 10; i++) {
      levels.push({
        id: uuidv4(),
        campaignId: campaigns[1].id,
        name: `Горный уровень ${i}`,
        description: `Покоряйте горные вершины на уровне ${i}`,
        levelNumber: 10 + i,
        energyCost: 10 + i,
        goldReward: 200 * i,
        expReward: 75 * i,
        itemRewards: JSON.stringify([
          { itemId: 'mana_potion', quantity: 1, chance: 0.4 },
          { itemId: 'mountain_artifact', quantity: 1, chance: 0.05 }
        ]),
        enemyDeck: JSON.stringify({
          enemies: [
            { type: 'troll', level: 10 + i, count: 1 + i },
            { type: 'eagle', level: 10 + i, count: Math.floor(i / 2) }
          ],
          boss: i === 10 ? 'mountain_king' : null
        }),
        requiredPower: 200 * i,
        imageUrl: `/images/levels/mountain_${i}.jpg`,
        isBossLevel: i === 10,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('CampaignLevels', levels, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CampaignLevels', null, {});
  }
};
