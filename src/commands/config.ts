import { APIInteractionDataResolvedChannel, APIRole, CacheType, ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, Role, SlashCommandBuilder, TextChannel } from "discord.js";
import { serverConfig } from "../functions";
import { Config } from "../create/config";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("config")
		.setDescription("Set all required IDs to use the bot.")
		.addSubcommandGroup(group =>
			group.setName("game")
				.setDescription("Select which games to enable.")
				.addSubcommand(scommand =>
					// TODO: Finish this
					scommand.setName("killing")
						.setDescription("Enable or Disable certain games.")
						.addBooleanOption(option => 
							option.setName("game-enable")
								.setDescription("Enable or disable game, though role and channel are still required.")
								.setRequired(true)
						).addChannelOption(option =>
							option.setName("channel")
								.setDescription("Select the channel you want to send game messages in.")
								.setRequired(true)    
						).addRoleOption(option => 
							option.setName("game-role")
								.setDescription("Select the role you want to be used for the game.")
								.setRequired(true)
						).addBooleanOption(option => 
							option.setName("enable-motives")
								.setDescription("Should motives be involved in the game? | Default: true")
								.setRequired(false)
						).addBooleanOption(option =>
							option.setName("enable-ping")
								.setDescription("Enable game ping role. | Default: true")
								.setRequired(false)
						)
				).addSubcommand(scommand =>
					scommand.setName("test")
						.setDescription("Test Description")
				)
		).setDMPermission(false).setDefaultMemberPermissions(
			PermissionFlagsBits.KickMembers + PermissionFlagsBits.BanMembers
		),
	// ! Bring back all comments
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		const subCommand = i.options.getSubcommand();

		if (subCommand == "killing-game") {
		// TODO: Make boolean option for enable or disable
			const enabled	= i.options.getBoolean("game-enable") as boolean;
			const role	= i.options.getRole("game-role");
			const channel	= i.options.getChannel("channel");
			let ping	= i.options.getBoolean("enable-ping");
			let motives	= i.options.getBoolean("enable-motives");
			const config	= await serverConfig(i, c) as Config;

			if (channel?.type !== ChannelType.GuildText) {
				return i.reply({
					content: "Please make sure this is a TextChannel."
				});
			}
			if (motives == null) { motives = true; }
			if (ping == null) { ping = true; }
			return await KillingGame(channel, enabled, ping, motives, role, i, config);
		}

		
		return console.log("No subcommand");

		
	}
};

async function KillingGame(
	channel: TextChannel | APIInteractionDataResolvedChannel,
	enabled: boolean,
	ping: boolean,
	motives: boolean,
	role: Role | APIRole | null,
	i: ChatInputCommandInteraction<CacheType>,
	config: Config
) {
	let games = config["dataValues"].enabledGames;
	games.push("killing-game");
	await config.update({
		channel: channel.id,
		role: role?.id,
		pingable: ping,
		motives: motives,
		enabledGames: games
	});

	return await i.reply({
		embeds: [
			new EmbedBuilder({
				title: `Server Config | Killing game: ${enabled == true ? "Enabled" : "Disabled"}`,
				fields: [{
					name: "Channel",
					value: `${channel}`,
					inline: true
				},{
					name: "Role",
					value: `${role?.name}`,
					inline: true
				},{
					name: "Pingable",
					value: ping == true ? "Enabled" : "Disabled",
					inline: true
				},{
					name: "Motives",
					value: motives == true ? "Enabled" : "Disabled",
					inline: true
				}]
			})
		]
	});
}