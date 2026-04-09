'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StrongholdSlot extends Model {
    static associate(models) {
      // связи нет
    }
  }

  StrongholdSlot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,      // просто идентификатор, без внешнего ключа
        allowNull: false,
      },
      fortIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Индекс укрепления (0..N-1)',
      },
      slotIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Индекс слота в укреплении',
      },
      playerName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Имя командующего (игрока)',
      },
      type: {
        type: DataTypes.ENUM('heroes', 'titans'),
        allowNull: false,
        defaultValue: 'heroes',
      },
      pet: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Питомец (только для типа heroes)',
      },
      heroes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [null, null, null, null, null],
        comment: 'Массив из 5 героев',
        validate: {
          isValidHeroesArray(value) {
            if (value && (!Array.isArray(value) || value.length !== 5)) {
              throw new Error('heroes должен быть массивом из 5 элементов');
            }
          },
        },
      },
      titans: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [null, null, null, null, null],
        comment: 'Массив из 5 титанов',
        validate: {
          isValidTitansArray(value) {
            if (value && (!Array.isArray(value) || value.length !== 5)) {
              throw new Error('titans должен быть массивом из 5 элементов');
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'StrongholdSlot',
      tableName: 'StrongholdSlots',   // единое имя таблицы
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'fortIndex', 'slotIndex'],
          name: 'unique_user_fort_slot',
        },
      ],
    }
  );

  return StrongholdSlot;
};
