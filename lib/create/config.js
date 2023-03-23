"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = exports.Config = void 0;
const sequelize_1 = require("sequelize");
const connect_1 = require("../secrets/connect");
class Config extends sequelize_1.Model {
}
exports.Config = Config;
Config.init({
    server: {
        type: sequelize_1.DataTypes.STRING(30),
        primaryKey: true,
        allowNull: false
    },
    channel: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: true
    },
    role: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: true
    },
    pingable: {
        type: sequelize_1.DataTypes.TINYINT({ length: 1 }),
        defaultValue: 1,
        allowNull: false
    },
    hasGame: {
        type: sequelize_1.DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0,
        allowNull: false
    },
    started: {
        type: sequelize_1.DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0,
        allowNull: false
    },
    isVoting: {
        type: sequelize_1.DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0,
        allowNull: false
    },
    votedKillers: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    }
}, { sequelize: connect_1.dbConnect, modelName: 'config', createdAt: false, updatedAt: false, freezeTableName: true });
async function createConfig(server) {
    let config = new Config({
        server: server
    });
    await config.save();
}
exports.createConfig = createConfig;
