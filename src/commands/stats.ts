import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { findKiller, findUser, serverConfig } from "../functions";
import { KillUser } from "../create/killing-user";
import { User } from "../create/user";
import { Config } from "../create/config";


// TODO: Make option for other games!
// ? Killing Game
// ? Card game
// ? etc
module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Check Your/Others overall stats")
		.addUserOption((option) => 
			option.setName("user")
				.setDescription("The User you want to view.")
				.setRequired(false)
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		const user = i.options.getUser("user")
			? [i.options.getUser("user")?.username, i.options.getUser("user")?.id]
			: [i.user.username, i.user.id];

		const config = await serverConfig(i, c) as Config;
		const baseUser = await findUser(i, c, { id: user[1] as string }) as User;
		const killerData = await findKiller(i, c, { id: user[1] as string }) as KillUser;

		const createButton: any = (id: string, label: string, style: ButtonStyle) => {
			if (!config["dataValues"].enabledGames.includes(id)
				&& id != "base-user"
				&& i.guild?.members.cache.get(i.user.id)?.roles.cache.some(role =>
					role.permissions.has([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers])
				)
			) {
				return new ActionRowBuilder().addComponents(
					new ButtonBuilder().setCustomId("create-" + id).setLabel(`Enable ${id}?`).setStyle(ButtonStyle.Danger)
				);
			}
			return new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style)
			);
		};
		const baseUserEmbed = new EmbedBuilder({
			title: user[0] as string,
			fields: [{
				name: "Balance",
				value: baseUser["dataValues"].balance as string
			}]
		});

		const message = await i.reply({
			embeds: [
				baseUserEmbed
			],
			components: [
				createButton("killing-game", "Killing Game", ButtonStyle.Success)
			],
			ephemeral: false
		});

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1000 * 10, idle: 1000 * 30 });
		collector.on("collect", ic => {
			switch (ic.customId) {
				case "killing-game":
					collector.resetTimer({ time: 1000 * 10 });
					ic.update({
						embeds: [
							new EmbedBuilder({
								title: `${user[0]}'s Overall Stats!`,
								fields: [{
									name: "Successful Kills",
									value: killerData["dataValues"].sucKill,
									inline: true
								},{
									name: "Times Caught",
									value: killerData["dataValues"].caught,
									inline: true
								}, {
									name: "Times as Victim",
									value: killerData["dataValues"].victim,
									inline: true
								}],
								footer: { text: "10 second timer reset!" }
							})
						],
						components: [createButton("base-user", "User Data", ButtonStyle.Primary)]
					});
					break;
				case "base-user":
					collector.resetTimer({ time: 1000 * 10 });
					ic.update({
						embeds: [baseUserEmbed.setFooter({ text: "10 second timer reset!" })],
						components: [createButton("killing-game", "Killing Game", ButtonStyle.Success)],
					});
					break;

				// * Create-__ specific cases
				// ? Could probably be made in a better way, but I'm dumb and also haven't programmed in a bit.
				case "create-killing-game": 

					break;
			}
		});
	}
};