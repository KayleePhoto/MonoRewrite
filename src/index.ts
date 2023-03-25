import { ActivityType, Client, Events, GatewayIntentBits } from 'discord.js';
import { defineCommands, findUser, serverConfig, submitError } from './functions';
import { config } from 'dotenv';
config({ path: './secrets/.env' });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds
	]
});

defineCommands(client);

client.on(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
	c.user.setPresence({
		status: 'dnd',
		activities: [{
			name: 'myself be rewritten!', // Set this to whatever you want
			type: ActivityType.Watching // Anything under ActivityType is valid
		}]
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;

	await findUser(interaction, client, {id: interaction.user.id});
	await serverConfig(interaction, client);

	try {
		await command.execute(interaction, client);
	} catch (err) {
		console.error(err);
		return submitError(err, client).then(() => {return;});
	}
});

client.login(process.env.Token);