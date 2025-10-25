'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем всех героев
    const heroes = await queryInterface.sequelize.query(
      'SELECT id FROM "Heroes";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const skills = [];
    
    heroes.forEach(hero => {
      // Базовые навыки для каждого героя
      skills.push({
        heroId: hero.id,
        name: 'Базовая атака',
        description: 'Стандартная атака',
        damage: 10,
        cooldown: 0,
        manaCost: 0,
        skillType: 'attack',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      skills.push({
        heroId: hero.id,
        name: 'Мощный удар',
        description: 'Сильная атака с повышенным уроном',
        damage: 25,
        cooldown: 2,
        manaCost: 20,
        skillType: 'attack',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      skills.push({
        heroId: hero.id,
        name: 'Лечение',
        description: 'Восстанавливает здоровье',
        heal: 15,
        cooldown: 3,
        manaCost: 15,
        skillType: 'heal',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await queryInterface.bulkInsert('HeroSkills', skills, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('HeroSkills', null, {});
  }
};
