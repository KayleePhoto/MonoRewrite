import * as path from "path";
import * as fs from "fs";
import { AttachmentBuilder, CacheType, ChannelType, ChatInputCommandInteraction, Client, Collection, TextChannel } from "discord.js";
import { config } from "dotenv";
import { createConfig, Config } from "./create/config";
import { KillUser, createKillerUser } from "./create/killing-user";
import { User, createUser } from "./create/user";
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

export async function submitError(err: any, c: Client) {
	const server		= c.guilds.cache.get(process.env.server as string);
	const errorChannel	= server?.channels.cache.get(process.env.channel as string);
	if (errorChannel?.type === ChannelType.GuildText) {
		return await errorChannel.send(`<@${process.env.author as string}>\n\`\`\`fix\n${err}\n\`\`\``);
	} else {
		console.log("Unable to get Error Channel.");
		return console.error(err);
	}
}

// TODO: I really need to make a dynamic User function.
// TODO: I'm so fucking god damn lazy...
/**
 * Find User in User DB, else create new user in guild.
 * @param {ChatInputCommandInteraction<CacheType>} i Only to reply
 * @param {Client} c Client for error reports
 * @param options The options to find a user
 * @returns {Promise<void | User>}
 */
export async function findUser(
	i: ChatInputCommandInteraction<CacheType>,
	c: Client,
	options: {
		id: string
	}
): Promise<void | User> {
	const user = await User.findOne({ where: options }) as User;
	if (!user) {
		try {
			await createUser(options.id);
			return await User.findOne({ where: options }) as User;
		} catch (e) {
			await i.reply({
				content: "There was an error creating the User data.",
				ephemeral: true
			});
			return submitError(e, c).then(() => {return;});
		}
	}
	return user;
}

/**
 * findKiller in KillUser DB, else create new user in guild.
 * @param {ChatInputCommandInteraction<CacheType>} i Not used for user id, only to reply.
 * @param {Client} c Client for error reports
 * @param options The options to find a user.
 * ie. find a killer in a server {isKiller: true, gameServer: i.guild?.id} 
 * @returns {Promise<void | KillUser>}
 */
export async function findKiller(
	i: ChatInputCommandInteraction<CacheType>,
	c: Client,
	options: {
		id?: string,
		isKiller?: boolean,
		isVictim?: boolean,
		gameServer?: string | null
	}
): Promise<void | KillUser> {
	const user = await KillUser.findOne({ where: options });
	if (!user) {
		try {
			await createKillerUser(
				options.id as string,
				options as {
					isKiller: boolean,
					isVictim: boolean,
					gameServer: string | null
				}
			);
			return await KillUser.findOne({ where: { id: options.id } }) as KillUser;
		} catch (err) {
			await i.reply({
				content: "There was an error creating the KillUser data.",
				ephemeral: true
			});
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
export async function serverConfig(
	i: ChatInputCommandInteraction<CacheType>,
	c: Client
): Promise<void | Config> {
	const config = await Config.findOne({ where: { server: i.guild?.id as string } });
	if (!config) {
		try {
			await createConfig(i.guild?.id as string);
			return await Config.findOne({ where: { server: i.guild?.id as string } }) as Config;
		} catch (err) {
			await i.reply({
				content: "There was an error creating the Server Config.",
				ephemeral: true
			});
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
	const images: string[] = [];
	const imagesPath = path.join(__dirname, `resources/${imgpath}`);
	const imageFiles = fs
		.readdirSync(imagesPath);
	for (const image of imageFiles) {
		images.push(image);
	}
	return images[Math.floor(Math.random() * images.length)];
}

export async function TimerMotivations(i: ChatInputCommandInteraction<CacheType>, c: Client) {
	const config = await serverConfig(i, c) as Config;
	const iTime = i.createdAt.getTime();
	// It is assumed that the timer in Config is in the getTime() format.
	const diff = iTime - config["dataValues"].timer;
	// Motives is guaranteed to be true, no need for a check.

	// ? 24 hours without killing motivation.
	if (diff == 24) {
		const gameChannel = i.guild?.channels.cache.get(config["dataValues"].channel) as TextChannel;
		// TODO: Create loop to handle coin removal
		await config.update({
			timer: iTime
		});
		return gameChannel.send({
			content: `It has been ${diff} hours since the last killing, everyone forfeits 100 coins!`,
			files: [new AttachmentBuilder("build/resources/timers/timer.gif")]
		});
	}
	// TODO: Starvation: use 24 hour timer to handle 1 hour changes? May be easier to just use another timestamp value in DB.
	return null;
}
// ? Starvation
// * every hour everyone loses ? coins
// ? 1,000 coins
// * Jackpot for whoever wins the killing game, max time after event starts: 15 minutes.
// * Gains additional 100 coins for each user that DOES NOT vote for them.
// ? Traitor "Bounty Hunter"
// * One player is publicly announced at random, whoever kills them gets extra coins as a reward.