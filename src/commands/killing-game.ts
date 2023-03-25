import { CacheType, ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel, User } from "discord.js";
import { findUser, serverConfig, sortRandomImages, submitError } from "../functions";
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
		let target = i.options.getUser('target') as User;
		let targetInGuild = i.guild?.members.cache.get(target.id);
		let config = await serverConfig(i, c) as Config;

		const gameChannel = i.guild?.channels.cache.get(config["dataValues"].channel) as TextChannel;
		const role = config['dataValues'].role;

		if (!gameChannel || !role) {
			return i.reply({
				content: 'Please make sure that the Game Channel and Game Role are set in `/config`',
				ephemeral: false
			});
		}
		if (!targetInGuild || target.bot) {
			return i.reply({
				content: 'This user is either a bot or does not exist in the guild.',
				ephemeral: true
			});
		}
		if (!i.guild?.members.cache.get(i.user.id)?.roles.cache.get(role) || !targetInGuild?.roles.cache.get(role)) {
			let gameRole = i.guild?.roles.cache.get(role);
			return i.reply({
				content: !targetInGuild?.roles.cache.get(config["dataValues"].role) ? `${target.username} does not have the ${gameRole?.name} role.` : `You do not have the ${gameRole?.name} role.`,
				ephemeral: true
			});
		}
		if (config['dataValues'].hasGame === true) {
			return i.reply({
				content: 'There is already a game happening in this server.',
				ephemeral: true
			});
		}
		if (i.user.id === target.id) {
			return i.reply({
				content: 'You can not kill yourself.',
				ephemeral: true
			});
		}

		
		let targetUser = await findUser(i, c, {id: target.id}) as UserDB;
		let killer = await findUser(i, c, {id: i.user?.id}) as UserDB;

		if (targetUser["dataValues"].isVictim === true) {
			return i.reply({
				content: 'This user is already in a killing game.',
				ephemeral: true
			});
		} else if (killer["dataValues"].isKiller === true) {
			return i.reply({
				content: 'You are already in a game.',
				ephemeral: true
			});
		}

		try {
			// ? Make database update function??? to remove the need for reinit?
			await killer.update({ isKiller: true, gameServer: i.guild.id});
			killer = await findUser(i, c, {id: i.user?.id}) as UserDB;
			await targetUser.update({ isVictim: true, gameServer: i.guild.id});
			targetUser = await findUser(i, c, {id: target.id}) as UserDB;

			await gameChannel.send({
				content: `**Game start** || ${config["dataValues"].pingable == true ? `${i.guild.roles.cache.get(config["dataValues"].role)}\n*Disable role ping with \`/config (channel) (role) false\`*` : i.guild?.roles.cache.get(config["dataValues"].role)?.name + `\n*Enable role ping with \`/config (channel) (role) true\`*`}\n\n**${target.username}** has been found dead. As you know, sometime after the body has been discovered, a class trial will start.\nSo, feel free to investigate in the mean time.\n*(10 minutes, this is to class trial start. You can take as long as you need.)*`,
				files: [{
					attachment: `build/resources/body/${await sortRandomImages('body')}`,
					name: 'SPOILER_Body.png',
					description: 'A dead body. | *Descriptive, I know.*'
				}]
			});

			await i.deferReply({ephemeral: true});
			await config.update({ hasGame: true, started: true });
			await wait(1000 * 60 * 10);
		} catch (e) {
			await config.update({hasGame: false, started: false});
			await killer.update({isKiller: false, gameServer: null});
			await targetUser.update({isVictim: false, gameServer: null});
			await i.reply({
				content: 'There was an error with the game.',
				ephemeral: true
			});
			return await submitError(e, c);
		}

		return await gameChannel.send({
			content: '**The class trial is starting!!**\nEveryone take your seats and prepare your arguments!',
			files: [{
				attachment: `build/resources/class-trial/${await sortRandomImages('class-trial')}`,
				name: 'Trial.png',
				description: 'The trial has begun!'
			}]
		});
	}
}