import { CacheType, ChannelType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
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
		let config	= serverConfig(i, c) as unknown as Config;

		console.log(channel as TextChannel);
		if (channel?.type !== ChannelType.GuildText)
			return i.reply({
				content: 'Please make sure this is a TextChannel.'
			});
		
		await config.update({
			channel: channel.id,
			role: role?.id,
			pingable: ping
		});

		return await i.reply({
			content: `Channel has been set to **${channel}**\nGame Role has been set to: **${role}** (Ping ${ping === true ? 'Enabled' : 'Disabled'})`
		});
	}
}