import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
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
			) {
				return new ActionRowBuilder().addComponents(
					new ButtonBuilder().setCustomId("disabled").setLabel(label).setStyle(ButtonStyle.Danger)
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
					collector.resetTimer({ time: 1000 * 30 });
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
								footer: { text: "30 second timer reset!" }
							})
						],
						components: [
							createButton("base-user", "User Data", ButtonStyle.Primary)
						]
					});
					break;
				case "base-user":
					collector.resetTimer({ time: 1000 * 30 });
					ic.update({
						embeds: [baseUserEmbed.setFooter({ text: "30 second timer reset!" })],
						components: [
							createButton("killing-game", "Killing Game", ButtonStyle.Success)
						],
					});
					break;

				case "disabled": 
					collector.resetTimer({ time: 1000 * 30 });
					ic.update({
						embeds: [new EmbedBuilder({
							title: "This game is currently not available.\nPlease see someone with the relative permissions to enable this game.",
							footer: { text: "This embed is likely to be changed. This is just a place holder for an idea." }
						})],
						components: [
							createButton("base-user", "User Data", ButtonStyle.Primary)
						]
					});
					break;
			}
		});
	}
};