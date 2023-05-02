import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";
import { TimerMotivations, defineCommands, findKiller, findUser, serverConfig, submitError } from "./functions";
import { config } from "dotenv";
import { Config } from "./create/config";
config({ path: "./secrets/.env" });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds
	]
});

defineCommands(client);

client.on(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
	c.user.setPresence({
		status: "dnd",
		activities: [{ // Set this to whatever you want.
			name: "myself be rewritten!",
			type: ActivityType.Watching
		}]
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;

	// Find__ used to create users, probably best to not do it, on every message for resources.
	// However, it helps prevent the user from not existing in the DB.
	// May change later, depending on how I feel about commands and interactions with other users.
	const config = await serverConfig(interaction, client) as Config;
	await findUser(interaction, client, { id: interaction.user.id });
	
	// * Motivation Timers
	if (config["dataValues"].enabledGames.includes("killing-game")) {
		await findKiller(interaction, client, { id: interaction.user.id });
		if (config["dataValues"].motives == true) {
			await TimerMotivations(interaction, client);
		}
	}

	try {
		await command.execute(interaction, client);
	} catch (err) {
		console.error(err);
		return submitError(err, client).then(() => {return;});
	}
});

client.login(process.env.Token);