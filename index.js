const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const controller = require("./controller");

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models/index.js");
db.sequelize.sync();
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to my application." });
});

app.get("/inventory", controller.getInventory);

app.get("/products", controller.getAllValidProducts);

app.post("/sales", controller.getSales);

app.post("/miscellaneous", controller.getMiscSales);

app.post("/purchases", controller.getPurchases);

app.post("/sales-entry", controller.salesEntry);

app.post("/misc-sales-entry", controller.addMiscSales);

app.post("/stock-entry", controller.stockEntry);

app.post("/add-product", controller.addProduct);

app.post("/delete-product", controller.deleteProduct);

app.post("/edit-product", controller.editProduct);

app.post("/delete-sale-entry", controller.deleteSales);

app.post("/delete-stock-entry", controller.deleteStockEntry);

app.post("/statistics", controller.getStats);

app.post("/bill-entry", controller.enterBill);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
