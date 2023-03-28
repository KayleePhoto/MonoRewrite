import { CacheType, ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("View the bot info."),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		await c.application?.fetch();
		const owner = c.application?.owner as User;

		return i.reply({
			embeds: [new EmbedBuilder({
				title: "**Info**",
				description: "Current Release Version: 0.0.1",
				fields: [{
					name: "Github Repository",
					value: "[Check the code](https://github.com/KayleePhoto/MonoRewrite)"
				},{
					name: "Github Issues",
					value: "[View or create a new issue](https://github.com/KayleePhoto/MonoRewrite/issues)"
				}],
				author: {
					name: owner.username + "#" + owner.discriminator,
					icon_url: owner.avatarURL({forceStatic: true}) as string
				}
			})]
		});
	}
};