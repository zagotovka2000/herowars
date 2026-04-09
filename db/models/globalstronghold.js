'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GlobalStronghold extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  GlobalStronghold.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1,
        autoIncrement: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'GlobalStronghold',
      tableName: 'GlobalStrongholds',
      timestamps: true,
    }
  );

  return GlobalStronghold;
};
