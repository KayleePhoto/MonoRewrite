"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const functions_1 = require("../functions");
// TODO: Make option for other games!
// ? Killing Game
// ? Card game
// ? etc
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check Your/Others overall stats')
        .addUserOption((option) => option.setName('user')
        .setDescription('The User you want to view.')
        .setRequired(false)),
    async execute(i, c) {
        var _a, _b;
        let user = i.options.getUser('user')
            ? [(_a = i.options.getUser('user')) === null || _a === void 0 ? void 0 : _a.username, (_b = i.options.getUser('user')) === null || _b === void 0 ? void 0 : _b.id]
            : [i.user.username, i.user.id];
        let userData = await (0, functions_1.findUser)(user[1], i, c, { isKiller: false, isVictim: false });
        await i.reply({
            embeds: [
                new discord_js_1.EmbedBuilder({
                    title: `${user[0]}'s Overall Stats!`,
                    fields: [{
                            name: 'Successful Kills',
                            value: userData["dataValues"].sucKill,
                            inline: true
                        }, {
                            name: 'Times Caught',
                            value: userData['dataValues'].caught,
                            inline: true
                        }, {
                            name: 'Times as Victim',
                            value: userData['dataValues'].victim,
                            inline: true
                        }]
                })
            ],
            ephemeral: true
        });
    }
};
