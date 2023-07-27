const { Model } = require("sequelize-yugabytedb");

module.exports = (sequelize, DataTypes) => {
  class Miscellaneous extends Model {
    static associate(models) {
      // define association here
    }
  }
  Miscellaneous.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      date: {
        allowNull: false,
        type: DataTypes.DATEONLY,
      },
      recharge: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      repairing: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      accessories: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Miscellaneous",
    }
  );
  return Miscellaneous;
};
