"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const functions_1 = require("./functions");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: './secrets/.env' });
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds
    ]
});
(0, functions_1.defineCommands)(client);
client.on(discord_js_1.Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);
    c.user.setPresence({
        status: 'dnd',
        activities: [{
                name: 'myself be rewritten!',
                type: discord_js_1.ActivityType.Watching // Anything under ActivityType is valid
            }]
    });
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command)
        return;
    await (0, functions_1.findUser)(interaction.user.id, interaction, client, { isKiller: false, isVictim: false });
    await (0, functions_1.serverConfig)(interaction, client);
    try {
        await command.execute(interaction, client);
    }
    catch (err) {
        console.error(err);
        return (0, functions_1.submitError)(err, client).then(() => { return; });
    }
});
client.login(process.env.Token);
