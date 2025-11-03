'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала создаем enum тип для battleType
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        CREATE TYPE "enum_Battles_battleType" AS ENUM ('pvp', 'guild_war', 'campaign', 'training');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END$$;
    `);

    // Добавляем недостающие поля в Battles
    await queryInterface.addColumn('Battles', 'battleType', {
      type: Sequelize.ENUM('pvp', 'guild_war', 'campaign', 'training'),
      defaultValue: 'pvp'
    });
    
    await queryInterface.addColumn('Battles', 'campaignLevelId', {
      type: Sequelize.UUID,
      allowNull: true
    });
    
    await queryInterface.addColumn('Battles', 'player1DeckSnapshot', {
      type: Sequelize.JSON,
      defaultValue: []
    });
    
    await queryInterface.addColumn('Battles', 'player2DeckSnapshot', {
      type: Sequelize.JSON,
      defaultValue: []
    });
    
    await queryInterface.addColumn('Battles', 'turns', {
      type: Sequelize.JSON,
      defaultValue: []
    });
    
    await queryInterface.addColumn('Battles', 'superAttackUsage', {
      type: Sequelize.JSON,
      defaultValue: []
    });
    
    await queryInterface.addColumn('Battles', 'rewards', {
      type: Sequelize.JSON,
      defaultValue: {}
    });

    // Добавляем внешний ключ для campaignLevelId (если таблица CampaignLevels существует)
    const tableExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'CampaignLevels'
      );
    `);

    if (tableExists[0][0].exists) {
      await queryInterface.addConstraint('Battles', {
        fields: ['campaignLevelId'],
        type: 'foreign key',
        name: 'fk_battle_campaignlevel',
        references: {
          table: 'CampaignLevels',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Удаляем добавленные колонки
    await queryInterface.removeColumn('Battles', 'battleType');
    await queryInterface.removeColumn('Battles', 'campaignLevelId');
    await queryInterface.removeColumn('Battles', 'player1DeckSnapshot');
    await queryInterface.removeColumn('Battles', 'player2DeckSnapshot');
    await queryInterface.removeColumn('Battles', 'turns');
    await queryInterface.removeColumn('Battles', 'superAttackUsage');
    await queryInterface.removeColumn('Battles', 'rewards');

    // Удаляем внешний ключ если существует
    try {
      await queryInterface.removeConstraint('Battles', 'fk_battle_campaignlevel');
    } catch (error) {
      // Игнорируем ошибку если ограничение не существует
    }

    // Удаляем enum тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Battles_battleType"');
  }
};
