import { CacheType, ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel } from "discord.js";
import { findUser, serverConfig, sortRandomImages } from "../functions";
import { Config } from "../create/config";
import { UserDB } from "../create/user";
import {setTimeout as wait} from "node:timers/promises";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("kill")
		.setDescription("Being the killing game!")
		.setDMPermission(false)
		.addUserOption((option) =>
			option.setName('target')
			.setDescription('The user you want to kill.')
			.setRequired(true)
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		let target = i.options.getUser('target');
		let targetInGuild = i.guild?.members.cache.get(target?.id as string);
		let config = await serverConfig(i, c) as Config;

		const gameChannel = i.guild?.channels.cache.get(config["dataValues"].channel) as TextChannel;
		const role = config['dataValues'].role;

		if (!gameChannel || !role) {
			return i.reply({
				content: 'Please make sure that the Game Channel and Game Role are set in `/config`',
				ephemeral: false
			});
		}
		if (!i.guild?.members.cache.get(i.user.id)?.roles.cache.get(role) || targetInGuild?.roles.cache.get(role)) {
			let gameRole = i.guild?.roles.cache.get(role);
			return i.reply({
				content: !targetInGuild?.roles.cache.get(config["dataValues"].role) ? `${target?.username} does not have the ${gameRole?.name} role.` : `You do not have the ${gameRole?.name} role.`,
				ephemeral: true
			});
		}
		if (config['dataValues'].hasGame === true) {
			return i.reply({
				content: 'There is already a game happening in this server.',
				ephemeral: true
			});
		}
		if (i.user.id === target?.id) {
			return i.reply({
				content: 'You can not kill yourself.',
				ephemeral: true
			});
		}

		let targetUser = await findUser(i, c, {id: target?.id as string, isKiller: false, isVictim: true, gameServer: i.guild.id}) as UserDB;
		let killer = await findUser(i, c, {id: i.user?.id}) as UserDB;

		if (targetUser["dataValues"].isVictim === true) {
			return i.reply({
				content: 'This user is already in a killing game.',
				ephemeral: true
			});
		}

		try {
			// ? Make database update function??? to remove the need for reinit?
			await killer.update({ isKiller: true, gameServer: i.guild.id});
			killer = await findUser(i, c, {id: i.user?.id}) as UserDB;

			await gameChannel.send({
				content: `**Game start** || ${config["dataValues"].pingable == true ? `${i.guild.roles.cache.get(config["dataValues"].role)}\n*Disable role ping with \`/config (channel) (role) false\`*` : i.guild?.roles.cache.get(config["dataValues"].role)?.name + `\n*Enable role ping with \`/config (channel) (role) true\`*`}\n\n**${target?.username}** has been found dead. As you know, sometime after the body has been discovered, a class trial will start.\nSo, feel free to investigate in the mean time.\n*(10 minutes, this is to class trial start. You can take as long as you need.)*`,
				files: [{
					attachment: `src/resources/class-trial/${sortRandomImages('body')}`,
					name: 'SPOILER_Body.png',
					description: 'A dead body. | *Descriptive, I know.*'
				}]
			});

			await i.deferReply({ephemeral: true});
			await wait(1000 * 60 * 10);
			await config.update({ hasGame: true, started: true });
		} catch {
			await config.update({hasGame: false, started: false});
			await killer.update({isKiller: false, gameServer: null});
			await targetUser.update({isVictim: false, gameServer: null});
			return await i.reply({
				content: 'There was an error with the game.',
				ephemeral: true
			});
		}

		return await gameChannel.send({
			content: '**The class trial is starting!!**\nEveryone take your seats and prepare your arguments!',
			files: [{
				attachment: `src/resources/class-trial/${sortRandomImages('class-trial')}`,
				name: 'Trial.png',
				description: 'The trial has begun!'
			}]
		});
	}
}