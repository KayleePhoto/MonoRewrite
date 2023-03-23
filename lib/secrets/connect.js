"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
(0, dotenv_1.config)({ path: __dirname + '/.env' });
exports.dbConnect = new sequelize_1.Sequelize(process.env.dbName, process.env.dbUser, process.env.dbPass, {
    host: process.env.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 1000
    },
    logging: false
});
