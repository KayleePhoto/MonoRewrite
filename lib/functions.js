"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverConfig = exports.findUser = exports.submitError = exports.defineCommands = void 0;
const path = require("path");
const fs = require("fs");
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const config_1 = require("./create/config");
const user_1 = require("./create/user");
(0, dotenv_1.config)({ path: './secrets/.env' });
function defineCommands(c) {
    c.commands = new discord_js_1.Collection();
    const cmdPath = path.join(__dirname, 'commands');
    const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));
    for (let file of cmdFiles) {
        let filePath = path.join(cmdPath, file);
        let command = require(filePath);
        c.commands.set(command.data.name, command);
    }
}
exports.defineCommands = defineCommands;
async function submitError(err, c) {
    const server = c.guilds.cache.get(process.env.server);
    const errorChannel = server === null || server === void 0 ? void 0 : server.channels.cache.get(process.env.channel);
    if ((errorChannel === null || errorChannel === void 0 ? void 0 : errorChannel.type) === discord_js_1.ChannelType.GuildText) {
        return await errorChannel.send(`<@${process.env.author}>\nError!\n\`\`\`fix\n${err}\n\`\`\``);
    }
    else {
        console.log('Unable to get Error Channel.');
        return console.error(err);
    }
}
exports.submitError = submitError;
async function findUser(userId, i, c, options) {
    var _a;
    let user = await user_1.UserDB.findOne({ where: { id: userId } });
    if (!user) {
        try {
            await (0, user_1.createUser)(userId, (_a = i.guild) === null || _a === void 0 ? void 0 : _a.id, options);
            return user = await user_1.UserDB.findOne({ where: { id: userId } });
        }
        catch (err) {
            i.reply({ content: `There was an error creating the User data.`, ephemeral: true });
            return submitError(err, c);
        }
    }
    return user;
}
exports.findUser = findUser;
async function serverConfig(i, c) {
    var _a, _b, _c;
    let config = await config_1.Config.findOne({ where: { server: (_a = i.guild) === null || _a === void 0 ? void 0 : _a.id } });
    if (!config) {
        try {
            await (0, config_1.createConfig)((_b = i.guild) === null || _b === void 0 ? void 0 : _b.id);
            return config = await config_1.Config.findOne({ where: { server: (_c = i.guild) === null || _c === void 0 ? void 0 : _c.id } });
        }
        catch (err) {
            await i.reply('There was an error creating the Server Config.');
            return submitError(err, c);
        }
    }
    return config;
}
exports.serverConfig = serverConfig;
