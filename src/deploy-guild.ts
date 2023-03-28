import { Routes, REST } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { Json } from "sequelize/types/utils";
config({ path: "./secrets/.env" });

const commands: Json[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.Token as string);
const Servers = [
	{"name": "dev", "id": process.env.server as string}
];
switch (process.argv[2]) {
case "create":
	if (!process.argv[3])
	{
		console.log("Please define a server to use.\n", Servers);
		break;
	}
	Servers.forEach(s => {
		if (s.name == process.argv[3])
		{
			return createCommands(commands, s.id);
		}
		return console.log("This server name, does not exist");
	});
	break;
case "delete":
	if (!process.argv[3])
	{
		console.log("Please define a server to use.\n", null, Servers);
		break;
	}
	Servers.forEach(s => {
		if (s.name == process.argv[3])
		{
			return deleteCommands(commands, s.id);
		}
		return console.log("This server name, does not exist");
	});
	break;
}

async function createCommands(cmds: Json[], serverId: string)
{
	try
	{
		console.log(`Started refreshing ${cmds.length} application (/) commands.`);
		const data: any = await rest.put(
			Routes.applicationGuildCommands(process.env.client_id as string, serverId),
			{ body: cmds }
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error)
	{
		console.error("38;5;1", error);
	}
}

async function deleteCommands(cmds: Json[], server: string)
{
	try
	{
		console.log(`Deleting ${cmds.length} application (/) commands.`);
		const data: any = await rest.put(
			Routes.applicationGuildCommands(process.env.client_id as string, server),
			{ body: [] }
		);
		console.log(`Successfully deleted ${data.length} application (/) commands.\n(Lower is better, if 0 all is deleted!)`);
	}
	catch (error)
	{
		console.log(error);
	}
}
