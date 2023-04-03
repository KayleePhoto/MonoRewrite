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
		if (config["dataValues"].enabledGames) { // TODO: Create Enabled games
			// ? []
			// ? ["killing"]
			// ? ["killing", "card"]
		}

		// TODO: Make the rest of the buttons.
		// TODO: Use object for data?
		// ? Turn into function for less copy paste code?
		const createButton: any = (id: string, label: string, style: ButtonStyle) => {
			return new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style)
			);
		};

		const message = await i.reply({
			embeds: [
				new EmbedBuilder({
					title: user[0] as string,
					fields: [{
						name: "Balance",
						value: baseUser["dataValues"].balance as string
					}]
				})
			], // TODO: Make base User embed.
			components: [
				// ? Json Format idea
				// ! config["dataValues"].enabledGames.includes("card") ? cardButton : null
				createButton("killing-game", "Killing Game", ButtonStyle.Danger)
			],
			ephemeral: false
		});

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1000 * 10 });
		collector.on("collect", ic => {
			if (ic.customId == "killing-game") {
				i.editReply({
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
								name:"Times as Victim",
								value: killerData["dataValues"].victim,
								inline: true
							}]
						})
					],
					components: [createButton("base-uesr", "User Data", ButtonStyle.Primary)]
				});
				collector.resetTimer({ time: 10 });
			}
		});
	}
};