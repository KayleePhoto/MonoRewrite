import { CacheType, ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { serverConfig } from "../functions";
import { Config } from "../create/config";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Set all required IDs to use the bot.')
		.addChannelOption((option) =>
			option.setName('channel')
			.setDescription('Select the channel you want to send game messages in.')
			.setRequired(true)	
		).addRoleOption((option) => 
			option.setName('game-role')
			.setDescription('Select the role you want to be used for the game.')
			.setRequired(true)
		).addBooleanOption((option) =>
			option.setName('ping-role')
			.setDescription('Enable or Disable game role ping.')
		).setDMPermission(false).setDefaultMemberPermissions(
			PermissionFlagsBits.KickMembers + PermissionFlagsBits.BanMembers
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		let role	= i.options.getRole('game-role');
		let channel	= i.options.getChannel('channel');
		let ping	= i.options.getBoolean('ping-role');
		let config	= await serverConfig(i, c) as Config;

		if (channel?.type !== ChannelType.GuildText) {
			return i.reply({
				content: 'Please make sure this is a TextChannel.'
			});
		}
		
		await config.update({
			channel: channel.id,
			role: role?.id,
			pingable: ping
		});

		return await i.reply({
			embeds: [
				new EmbedBuilder({
					title: 'Server Config',
					fields: [{
						name: 'Channel',
						value: `${channel}`,
						inline: true
					},{
						name: 'Role',
						value: `${role?.name}`,
						inline: true
					},{
						name: 'Pingable',
						value: ping === true ? 'Enabled' : 'Disabled',
						inline: true
					}]
				})
			]
		});
	}
}