import * as path from "path";
import * as fs from "fs";
import { CacheType, ChannelType, ChatInputCommandInteraction, Client, Collection } from "discord.js";
import { config } from "dotenv";
import { createConfig, Config } from "./create/config";
import { createUser, UserDB } from "./create/user";
config({ path: "./secrets/.env" });

export function defineCommands(c: Client) {
	c.commands = new Collection();
	const cmdPath = path.join(__dirname, "commands");
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith(".js"));
	for (const file of cmdFiles) {
		const filePath = path.join(cmdPath, file);
		const command = require(filePath);
		c.commands.set(command.data.name, command);
	}
}

export async function submitError(err: unknown, c: Client) {
	const server		= c.guilds.cache.get(process.env.server as string);
	const errorChannel	= server?.channels.cache.get(process.env.channel as string);
	if (errorChannel?.type === ChannelType.GuildText) {
		return await errorChannel.send(`<@${process.env.author as string}>\n\`\`\`fix\n${err}\n\`\`\``);
	} else {
		console.log("Unable to get Error Channel.");
		return console.error(err);
	}
}

/**
 * FindUser in UserDB, else create new user in guild.
 * @param {ChatInputCommandInteraction<CacheType>} i Not used for user id, only to reply.
 * @param {Client} c Client for error reports
 * @param options The options to find a user.  
 * ie. find a killer in a server {isKiller: true, gameServer: i.guild?.id} 
 * @returns {Promise<void | UserDB>}
 */
export async function findUser(i: ChatInputCommandInteraction<CacheType>, c: Client, options: {id?: string, isKiller?: boolean, isVictim?: boolean, gameServer?: string | null}): Promise<void | UserDB> {
	const user = await UserDB.findOne({where: options});
	if (!user) {
		try {
			await createUser(options.id as string, options as {isKiller: boolean, isVictim: boolean, gameServer: string | null});
			return await UserDB.findOne({where: {id: options.id}}) as UserDB;
		} catch (err) {
			await i.reply({ content: "There was an error creating the User data.", ephemeral: true });
			return submitError(err, c).then(() => {return;});
		}
	}
	return user;
}

/**
 * Find server config, else create one.
 * @param {ChatInputCommandInteraction<CacheType>} i Gets the current guild id
 * @param {Client} c Client for error reports
 * @returns {Promise<void | Config>}
 */
export async function serverConfig(i: ChatInputCommandInteraction<CacheType>, c: Client): Promise<void | Config> {
	const config = await Config.findOne({ where: { server: i.guild?.id as string } });
	if (!config) {
		try {
			await createConfig(i.guild?.id as string);
			return await Config.findOne({ where: { server: i.guild?.id as string } }) as Config;
		} catch (err) {
			await i.reply({content: "There was an error creating the Server Config.", ephemeral: true});
			return submitError(err, c).then(() => {return;});
		}
	}
	return config;
}

/**
 * Sort random Images  
 * Sorts through specified folder and returns a random image in side that folder.
 * @param {string} imgpath The name of the folder.  
 * ie. "class-trial"
 * @returns {string}
 */
export function sortRandomImages(imgpath: string): string {
	const images = [];
	const imagesPath = path.join(__dirname, `resources/${imgpath}`);
	const imageFiles = fs
		.readdirSync(imagesPath);
	for (const image of imageFiles) {
		images.push(image);
	}
	return images[Math.floor(Math.random() * images.length)];
}