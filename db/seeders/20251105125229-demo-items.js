'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Items', [
      {
        id: uuidv4(),
        name: 'Меч дракона',
        type: 'upgrade',
        color: 'orange',
        requiredRank: 5,
        targetColor: 'blue',
        targetSlot: 1,
        statBonus: JSON.stringify({ attack: 150, health: 75 }),
        dropChance: 0.05,
        energyCost: 20,
        imageUrl: '/images/items/dragon_sword.png',
        description: 'Легендарный меч из чешуи дракона',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Щит стража',
        type: 'upgrade',
        color: 'blue',
        requiredRank: 3,
        targetColor: 'green',
        targetSlot: 2,
        statBonus: JSON.stringify({ defense: 100, health: 120 }),
        dropChance: 0.1,
        energyCost: 15,
        imageUrl: '/images/items/guardian_shield.png',
        description: 'Прочный щит королевской гвардии',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Зелье здоровья',
        type: 'consumable',
        color: 'green',
        requiredRank: 1,
        targetColor: 'gray',
        targetSlot: 0,
        statBonus: JSON.stringify({ heal: 250 }),
        dropChance: 0.3,
        energyCost: 5,
        imageUrl: '/images/items/health_potion.png',
        description: 'Восстанавливает 250 здоровья',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Артефакт древних',
        type: 'special',
        color: 'red',
        requiredRank: 10,
        targetColor: 'orange',
        targetSlot: 3,
        statBonus: JSON.stringify({ attack: 200, defense: 100, speed: 50 }),
        dropChance: 0.01,
        energyCost: 50,
        imageUrl: '/images/items/ancient_artifact.png',
        description: 'Древний артефакт забытой цивилизации',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Кольцо маны',
        type: 'upgrade',
        color: 'blue',
        requiredRank: 7,
        targetColor: 'blue',
        targetSlot: 4,
        statBonus: JSON.stringify({ mana: 180, intelligence: 90 }),
        dropChance: 0.08,
        energyCost: 25,
        imageUrl: '/images/items/mana_ring.png',
        description: 'Кольцо, усиливающее магическую силу',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Items', null, {});
  }
};
