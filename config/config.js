const fs = require("fs");
module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.PG_YUGA_PORT,
    dialect: process.env.DIALECT,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("root.crt").toString(),
      },
    },
  },
  //   ,
  //   test: {
  //     username: process.env.DB_USERNAME,
  //     password: process.env.DB_PASSWORD,
  //     database: process.env.DB_NAME,
  //     host: process.env.DB_HOST,
  //     port: 5433,
  //     dialect: process.env.DIALECT,
  //     dialectOptions: {
  //       ssl: {
  //         require: true,
  //         rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
  //       },
  //     },
  //   },
  //   production: {
  //     username: process.env.DB_USERNAME,
  //     password: process.env.DB_PASSWORD,
  //     database: process.env.DB_NAME,
  //     host: process.env.DB_HOST,
  //     dialect: process.env.DIALECT,
  //     port: 5433,
  //     dialectOptions: {
  //       ssl: {
  //         require: true,
  //         rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
  //       },
  //     },
  //   },
};
