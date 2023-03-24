import * as path from 'path';
import * as fs from 'fs';
import { CacheType, ChannelType, ChatInputCommandInteraction, Client, Collection } from 'discord.js';
import { config } from 'dotenv';
import { createConfig, Config } from './create/config';
import { createUser, UserDB } from './create/user'
config({ path: './secrets/.env' });

export function defineCommands(c: Client) {
	c.commands = new Collection();
	const cmdPath = path.join(__dirname, 'commands');
	const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));
	for (let file of cmdFiles) {
		let filePath = path.join(cmdPath, file);
		let command = require(filePath);
		c.commands.set(command.data.name, command);
	}
}

export async function submitError(err: any, c: Client) {
	const server		= c.guilds.cache.get(process.env.server as string);
	const errorChannel	= server?.channels.cache.get(process.env.channel as string);
	if (errorChannel?.type === ChannelType.GuildText) {
		return await errorChannel.send(`<@${process.env.author as string}>\nError!\n\`\`\`fix\n${err}\n\`\`\``);
	} else {
		console.log('Unable to get Error Channel.');
		return console.error(err);
	}
}

export async function findUser(userId: string, i: ChatInputCommandInteraction<CacheType>, c: Client, options?: {id?: string, isKiller?: boolean, isVictim?: boolean, server?: string}) {
	let user = await UserDB.findOne({where: { id: userId }});
	if (!user) {
		try {
			await createUser(userId, options as {isKiller: boolean, isVictim: boolean});
			return user = await UserDB.findOne({where: { id: userId }});
		} catch (err) {
			await i.reply({ content: `There was an error creating the User data.`, ephemeral: true });
			return submitError(err, c);
		}
	}
	return await UserDB.findOne({where: options});
}

export async function serverConfig(i: ChatInputCommandInteraction<CacheType>, c: Client) {
	let config = await Config.findOne({ where: { server: i.guild?.id } });
	if (!config) {
		try {
			await createConfig(i.guild?.id as string);
			return config = await Config.findOne({ where: { server: i.guild?.id } });
		} catch (err) {
			await i.reply('There was an error creating the Server Config.');
			return submitError(err, c);
		}
	}
	return config;
}

export async function sortRandomImages(imgpath: string) {
	const images = [];
	const imagesPath = path.join(__dirname, `resources/${imgpath}`);
	const imageFiles = fs
		.readdirSync(imagesPath)
		.filter((file) => file.endsWith(".gif"));
	for (const image of imageFiles) {
		images.push(image);
	}
	return images[Math.floor(Math.random() * images.length)];
}