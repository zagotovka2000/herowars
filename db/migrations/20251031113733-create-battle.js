'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Battles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      type: {
        type: Sequelize.ENUM('pvp', 'guild_war', 'training')
      },
      player1Id: {
        type: Sequelize.UUID
      },
      player2Id: {
        type: Sequelize.UUID
      },
      guild1Id: {
        type: Sequelize.UUID
      },
      guild2Id: {
        type: Sequelize.UUID
      },
      winnerId: {
        type: Sequelize.UUID
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'finished', 'cancelled'),
        defaultValue: 'pending'
      },
      player1Deck: {
        type: Sequelize.JSON
      },
      player2Deck: {
        type: Sequelize.JSON
      },
      battleLog: {
        type: Sequelize.JSON
      },
      turnsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      trophyChange: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      finishedAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Добавляем внешние ключи
    await queryInterface.addConstraint('Battles', {
      fields: ['player1Id'],
      type: 'foreign key',
      name: 'fk_battle_player1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Battles', {
      fields: ['player2Id'],
      type: 'foreign key',
      name: 'fk_battle_player2',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Battles', {
      fields: ['winnerId'],
      type: 'foreign key',
      name: 'fk_battle_winner',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Battles', {
      fields: ['guild1Id'],
      type: 'foreign key',
      name: 'fk_battle_guild1',
      references: {
        table: 'Guilds',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Battles', {
      fields: ['guild2Id'],
      type: 'foreign key',
      name: 'fk_battle_guild2',
      references: {
        table: 'Guilds',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Battles', 'fk_battle_player1');
    await queryInterface.removeConstraint('Battles', 'fk_battle_player2');
    await queryInterface.removeConstraint('Battles', 'fk_battle_winner');
    await queryInterface.removeConstraint('Battles', 'fk_battle_guild1');
    await queryInterface.removeConstraint('Battles', 'fk_battle_guild2');
    await queryInterface.dropTable('Battles');
  }
};
