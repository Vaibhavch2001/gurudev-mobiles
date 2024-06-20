const { Model } = require("sequelize-yugabytedb");

module.exports = (sequelize, DataTypes) => {
  class StockReturn extends Model {
    static associate(models) {
      StockReturn.belongsTo(models.Product);
    }
  }
  StockReturn.init(
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
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "StockReturn",
    }
  );
  return StockReturn;
};
