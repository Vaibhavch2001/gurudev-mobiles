const { Model } = require("sequelize-yugabytedb");

module.exports = (sequelize, DataTypes) => {
  class BillCount extends Model {
    static associate(models) {
      // define association here
    }
  }
  BillCount.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      count: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "BillCount",
    }
  );
  return BillCount;
};
