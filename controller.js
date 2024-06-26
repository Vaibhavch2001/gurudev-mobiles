const {
  Product,
  Inventory,
  Sale,
  Purchase,
  Miscellaneous,
  BillCount,
  Invoice,
  StockReturn,
} = require("./models/index");
const { notifyChange } = require("./helper");

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: Product,
    });
    res.status(200).send(inventory);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
exports.getAllValidProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isValid: 1,
      },
    });
    res.status(200).send(products);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      where: {
        date: req.body.date,
      },
      include: [Product, Invoice],
    });
    res.status(200).send(sales);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
exports.getMiscSales = async (req, res) => {
  try {
    const miscSales = await Miscellaneous.findAll({
      where: {
        date: req.body.date,
      },
    });
    res.status(200).send(miscSales);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: {
        date: req.body.date,
      },
      include: Product,
    });
    res.status(200).send(purchases);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
exports.addProduct = async (req, res) => {
  try {
    const newProduct = await Product.create({
      name: req.body.name,
      brand: req.body.brand,
      color: req.body.color,
      size: req.body.size,
      isValid: 1,
    });
    await newProduct.save();
    notifyChange(
      `New Product created - ${newProduct.brand} ${newProduct.name}, ${newProduct.size}, ${newProduct.color}`
    );
    res.status(200).send(newProduct);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.addMiscSales = async (req, res) => {
  try {
    await Miscellaneous.destroy({
      where: {
        date: req.body.date,
      },
    });
    const miscScales = await Miscellaneous.create({
      recharge: req.body.recharge,
      repairing: req.body.repairing,
      accessories: req.body.accessories,
      date: req.body.date,
    });
    await miscScales.save();
    res.status(200).send(miscScales);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.editProduct = async (req, res) => {
  try {
    await Product.update(
      {
        name: req.body.name,
        brand: req.body.brand,
        color: req.body.color,
        size: req.body.size,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      where: {
        ProductId: req.body.productId,
      },
    });
    if (inventory.length !== 0 && inventory[0].quantity !== 0) {
      notifyChange(`Attempt made to delete model which had stock`);
      res
        .status(500)
        .send("Deletion unsuccessful since this product has stock.");
      return;
    }
    await Inventory.destroy({
      where: {
        ProductId: req.body.productId,
      },
    });
    await Product.update(
      { isValid: 0 },
      {
        where: {
          id: req.body.productId,
        },
      }
    );
    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
exports.salesEntry = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      where: {
        ProductId: req.body.productId,
      },
    });
    if (inventory.length === 0) {
      res.status(500).send("Sale unsuccessful");
      return;
    }

    if (inventory[0].quantity < req.body.quantity) {
      res.status(500).send("Not enough quantity to sell");
      return;
    }

    const newQuantity = inventory[0].quantity - req.body.quantity;

    const billNumbers = await BillCount.findAll({ order: [["count", "ASC"]] });
    console.log(billNumbers);
    if (billNumbers.length == 1) {
      await BillCount.update(
        { count: billNumbers[0].count + 1 },
        {
          where: {
            id: billNumbers[0].id,
          },
        }
      );
    } else {
      await BillCount.destroy({
        where: { id: billNumbers[0].id },
      });
    }

    const newSale = await Sale.create({
      date: req.body.date,
      quantity: req.body.quantity,
      amount: req.body.amount,
      ProductId: req.body.productId,
      billnumber: billNumbers[0].count,
    });

    await newSale.save();

    await Inventory.update(
      { quantity: newQuantity },
      {
        where: {
          id: inventory[0].id,
        },
      }
    );
    const product = await Product.findAll({
      where: {
        id: req.body.productId,
      },
    });
    notifyChange(
      `New Product sold. Bill amount - Rs ${req.body.amount}. Product -  ${product[0].brand} ${product[0].name}, ${product[0].size}, ${product[0].color}`
    );
    console.log("Hi", { ...newSale, billNum: billNumbers[0].count });
    res.status(200).send({ ...newSale, billNum: billNumbers[0].count });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.stockEntry = async (req, res) => {
  try {
    let inventory = await Inventory.findAll({
      where: {
        ProductId: req.body.productId,
      },
    });

    const newPurchase = await Purchase.create({
      date: req.body.date,
      quantity: req.body.quantity,
      costprice: req.body.costPrice,
      ProductId: req.body.productId,
    });
    const product = await Product.findAll({
      where: {
        id: req.body.productId,
      },
    });
    await newPurchase.save();
    if (inventory.length === 0) {
      inventory = await Inventory.create({
        quantity: req.body.quantity,
        ProductId: req.body.productId,
        costprice: req.body.costPrice,
      });
      await inventory.save();
    } else {
      await Inventory.update(
        {
          quantity: inventory[0].quantity + req.body.quantity,
          costprice: req.body.costPrice,
        },
        {
          where: {
            id: inventory[0].id,
          },
        }
      );
    }
    notifyChange(
      `Purchase Entry Added. Purchase quantity - ${req.body.quantity}, amount - ${req.body.costPrice}. Product -  ${product[0].brand} ${product[0].name}, ${product[0].size}, ${product[0].color}`
    );
    res.status(200).send(newPurchase);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.deleteSales = async (req, res) => {
  try {
    let sale = await Sale.findAll({
      where: {
        id: req.body.id,
      },
    });
    let inventory = await Inventory.findAll({
      where: {
        ProductId: sale[0].ProductId,
      },
    });
    if (inventory.length === 0) {
      res.status(500).send("Exception");
      return;
    }
    if (sale[0].billnumber) {
      const newBillCount = await BillCount.create({
        count: sale[0].billnumber,
      });
      await newBillCount.save();
    }
    await Inventory.update(
      { quantity: inventory[0].quantity + sale[0].quantity },
      {
        where: {
          id: inventory[0].id,
        },
      }
    );
    await Sale.destroy({
      where: { id: req.body.id },
    });
    await Invoice.destroy({
      where: { id: sale[0].InvoiceId },
    });
    const product = await Product.findAll({
      where: {
        id: sale[0].ProductId,
      },
    });
    notifyChange(
      `Deleted a sale entry. Please check and verify. Sale amount - Rs ${sale[0].amount}, Sale date - ${sale[0].date}, Product - ${product[0].brand} ${product[0].name}, ${product[0].size}, ${product[0].color}`
    );
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.deleteStockEntry = async (req, res) => {
  try {
    let purchase = await Purchase.findAll({
      where: {
        id: req.body.id,
      },
    });
    let inventory = await Inventory.findAll({
      where: {
        ProductId: purchase[0].ProductId,
      },
    });
    if (
      inventory.length === 0 ||
      inventory[0].quantity < purchase[0].quantity
    ) {
      res.status(500).send("Exception");
      return;
    }
    await Inventory.update(
      { quantity: inventory[0].quantity - purchase[0].quantity },
      {
        where: {
          id: inventory[0].id,
        },
      }
    );
    const product = await Product.findAll({
      where: {
        id: purchase[0].ProductId,
      },
    });
    await Purchase.destroy({
      where: { id: req.body.id },
    });
    notifyChange(
      `Deleted a Purchase Order item. Please verify if correct. Purchase quantity - ${purchase[0].quantity}. Product -  ${product[0].brand} ${product[0].name}, ${product[0].size}, ${product[0].color}`
    );
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.enterBill = async (req, res) => {
  try {
    const newInvoice = await Invoice.create({
      billNumber: req.body.billNumber,
      url: req.body.url,
    });
    await newInvoice.save();
    await Sale.update(
      { InvoiceId: newInvoice.id },
      {
        where: {
          id: req.body.saleId,
        },
      }
    );
    notifyChange(`Bill for previous sale - ${req.body.url}`);
    res.status(200).send(newInvoice);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.getStats = async (req, res) => {
  try {
    let givenYear = req.body.year;
    let givenMonth = req.body.month;
    const startDate = new Date(givenYear, givenMonth - 1, 1); // Create the start date for the given month
    const endDate = new Date(givenYear, givenMonth, 0); // Create the end date for the given month

    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.between]: [
            Sequelize.literal(`DATE('${startDate.toISOString()}')`),
            Sequelize.literal(`DATE('${endDate.toISOString()}')`),
          ],
        },
      },
    });
    const purchases = await Purchase.findAll({
      where: {
        date: {
          [Op.between]: [
            Sequelize.literal(`DATE('${startDate.toISOString()}')`),
            Sequelize.literal(`DATE('${endDate.toISOString()}')`),
          ],
        },
      },
    });
    const saleQuantity = sales.reduce((acc, curr) => {
      return acc + curr.quantity;
    }, 0);

    const purchaseQuantity = purchases.reduce((acc, curr) => {
      return acc + curr.quantity;
    }, 0);

    const saleAmount = sales.reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);

    res.status(200).send({
      saleQuantity: saleQuantity,
      purcaseQuantity: purchaseQuantity,
      saleAmount: saleAmount,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.stockReturn = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      where: {
        ProductId: req.body.productId,
      },
    });
    if (inventory.length === 0) {
      res.status(500).send("Unable to return stock");
      return;
    }

    if (inventory[0].quantity < req.body.quantity) {
      res.status(500).send("Return quantity > inventory");
      return;
    }

    const returnItem = await StockReturn.create({
      date: req.body.date,
      quantity: req.body.quantity,
      ProductId: req.body.productId,
    });

    await returnItem.save();

    const newQuantity = inventory[0].quantity - req.body.quantity;

    await Inventory.update(
      { quantity: newQuantity },
      {
        where: {
          id: inventory[0].id,
        },
      }
    );
    const product = await Product.findAll({
      where: {
        id: req.body.productId,
      },
    });
    notifyChange(
      `Product returned to Company. Quantity - ${req.body.quantity}. Product -  ${product[0].brand} ${product[0].name}, ${product[0].size}, ${product[0].color}`
    );
    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
