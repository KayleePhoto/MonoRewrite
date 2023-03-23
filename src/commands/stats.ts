import { CacheType, ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { findUser } from "../functions";
import { UserDB } from "../create/user";


// TODO: Make option for other games!
// ? Killing Game
// ? Card game
// ? etc
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Check Your/Others overall stats')
		.addUserOption((option) => 
			option.setName('user')
			.setDescription('The User you want to view.')
			.setRequired(false)
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		let user = i.options.getUser('user')
			? [i.options.getUser('user')?.username, i.options.getUser('user')?.id]
			: [i.user.username, i.user.id];
		
		let userData = await findUser(user[1] as string, i, c, { isKiller: false, isVictim: false }) as UserDB;

		await i.reply({
			embeds: [
				new EmbedBuilder({
					title: `${user[0]}'s Overall Stats!`, // TODO: Make game options
					fields: [{
						name: 'Successful Kills',
						value: userData["dataValues"].sucKill,
						inline: true
					},{
						name: 'Times Caught',
						value: userData['dataValues'].caught,
						inline: true
					}, {
						name:'Times as Victim',
						value: userData['dataValues'].victim,
						inline: true
					}]
				})
			],
			ephemeral: true
		});
	}
}