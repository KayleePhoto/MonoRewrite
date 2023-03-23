"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.UserDB = void 0;
const sequelize_1 = require("sequelize");
const connect_1 = require("../secrets/connect");
class UserDB extends sequelize_1.Model {
}
exports.UserDB = UserDB;
UserDB.init({
    id: {
        type: sequelize_1.DataTypes.STRING(30),
        primaryKey: true,
        allowNull: false
    },
    sucKill: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    victim: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    caught: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isKiller: {
        type: sequelize_1.DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0
    },
    isVictim: {
        type: sequelize_1.DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0
    },
    gameServer: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: true
    }
}, {
    sequelize: connect_1.dbConnect,
    modelName: 'user',
    freezeTableName: true,
    updatedAt: false,
    createdAt: false
});
async function createUser(id, server, options) {
    const user = new UserDB({
        id: id,
        isKiller: options === null || options === void 0 ? void 0 : options.isKiller,
        isVictim: options === null || options === void 0 ? void 0 : options.isVictim,
        gameServer: server
    });
    await user.save();
}
exports.createUser = createUser;
