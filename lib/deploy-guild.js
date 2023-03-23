"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs = require("fs");
const path = require("path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: './secrets/.env' });
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}
const rest = new discord_js_1.REST({ version: "10" }).setToken(process.env.Token);
let Servers = [
    { "name": 'dev', "id": process.env.devServerID }
];
switch (process.argv[2]) {
    case 'create':
        if (!process.argv[3]) {
            console.log(`Please define a server to use.\n`, Servers);
            break;
        }
        Servers.forEach(s => {
            if (s.name == process.argv[3]) {
                return createCommands(commands, s.id);
            }
            return console.log('This server name, does not exist');
        });
        break;
    case 'delete':
        if (!process.argv[3]) {
            console.log(`Please define a server to use.\n`, null, Servers);
            break;
        }
        Servers.forEach(s => {
            if (s.name == process.argv[3]) {
                return deleteCommands(commands, s.id);
            }
            return console.log('This server name, does not exist');
        });
        break;
}
async function createCommands(cmds, serverId) {
    try {
        console.log(`Started refreshing ${cmds.length} application (/) commands.`);
        const data = await rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.client_id, serverId), { body: cmds });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error('38;5;1', error);
    }
}
;
async function deleteCommands(cmds, server) {
    try {
        console.log(`Deleting ${cmds.length} application (/) commands.`);
        const data = await rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.client_id, server), { body: [] });
        console.log(`Successfully deleted ${data.length} application (/) commands.\n(Lower is better, if 0 all is deleted!)`);
    }
    catch (error) {
        console.log(error);
    }
}
