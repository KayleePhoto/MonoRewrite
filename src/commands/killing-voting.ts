import { AttachmentBuilder, CacheType, ChatInputCommandInteraction, Client, EmbedBuilder, GuildMember, SlashCommandBuilder, TextChannel } from "discord.js";
import { findUser, serverConfig, sortRandomImages, submitError } from "../functions";
import { Config } from "../create/config";
import { UserDB } from "../create/user";
import { randomUUID } from "crypto";
import {setTimeout as wait} from "node:timers/promises";
import { Spec, View, parse } from "vega";
import * as sharp from "sharp";
import * as fs from "fs";

let globalUUID: string;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("vote")
		.setDescription("Begin the voting phase of the killing game.")
		.setDMPermission(false)
		.addUserOption((option) => 
			option.setName("target")
				.setDescription("The user you want to vote for as possible killer.")
				.setRequired(true)
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		// ? Make neater? if possible?
		const config = await serverConfig(i, c) as Config;
		const target = i.guild?.members.cache.get(i.options.getUser("target")?.id as string) as GuildMember;
		const gameChannel = i.guild?.channels.cache.get(config["dataValues"].channel) as TextChannel;
		if (!target.roles.cache.get(config["dataValues"].role)) {
			return i.reply({
				content: "This user does not have the game role. They could not have killed.",
				ephemeral: true
			});
		}

		const killer = await findUser(i, c, {gameServer: i.guild?.id as string, isKiller: true}) as UserDB;
		const victim = await findUser(i, c, {gameServer: i.guild?.id as string, isVictim: true}) as UserDB;
		const voter = await findUser(i, c, {id: i.user.id}) as UserDB;

		if (config["dataValues"].started === false) {
			return i.reply({
				content: "Please wait for the class trial to begin.",
				ephemeral: true
			});
		}
		if (voter["dataValues"].isVictim == true) {
			return i.reply({
				content: "You are the victim, you are unable to vote."
			});
		}

		if (config["dataValues"].isVoting == true) {
			const killers = config["dataValues"].votedKillers;
			return killers.forEach(async (killer: { voters: string | string[]; name: string; id: string; }) => {
				if (killer.voters.includes(i.user.id)) {
					return await i.reply({
						content: `You have already voted.\nYou Voted for: **${killer.name}**`
					});
				}
				if (killer.id === target.id) {
					killers[killers.indexOf(killer)].voters.push(i.user.id);
				} else {
					killers.push({
						id: target.id,
						name: target.displayName,
						voters: [i.user.id]
					});
				}
				await config.update({
					votedKillers: killers
				});
				return await i.reply({
					content: `Your vote is locked in!\nYou voted for **${target.displayName}**`,
					ephemeral: true
				});
			});
		}
		
		try {
			await i.deferReply({ ephemeral: true });
			await config.update({
				isVoting: true,
				votedKillers: [{
					id: target.id,
					name: target.displayName,
					voters: [i.user.id]
				}]
			});
			await gameChannel.send({
				content: "The voting process has begun! You have 5 minutes to finalize!\nOnce you vote, you are locked in.\n*Use `/vote` to begin.*"
			});

			await wait(1000 * 60 * 2);
			await gameChannel.send({
				content: "3 minutes left to conclude your votes!\n**Remember! Once you vote, it is locked in!**"
			});
			await wait(1000 * 60 * 3);

			// ? To keep votedKillers list for the chart, I label this var, before .update
			const votedKillers = config["dataValues"].votedKillers;
			const votedUsers = getMaxNum(votedKillers);
			let vote: any;
			
			await config.update({
				isVoting: false,
				hasGame: false,
				started: false,
				votedKillers: null
			});

			if (votedUsers.length > 1) {
				vote = votedUsers[Math.floor(Math.random() * votedUsers.length)];
			} else {
				vote = votedUsers[0];
			}

			await makeChart(votedKillers);
			await wait(1000);
			await gameChannel.send({
				embeds: [new EmbedBuilder({
					title: "The voting has concluded!",
					color: 10038562,
					description: `${votedUsers.length > 1 ? `There was a time! Randomly selected someone!\n${vote.name}` : vote.name} has been voted out...`,
					image: {
						url: "attachment://chart.png"
					}
				})],
				content: `The voting has concluded\n${
					votedUsers.length > 1
						? `There was a tie! Randomly selecting someone!\n${vote.name}`
						: vote.name
				} has been voted out...`,
				files: [new AttachmentBuilder(`build/temp/chart-${globalUUID}.png`, {name: "chart.png"})]
			});

			try {
				fs.unlinkSync(`build/temp/chart-${globalUUID}.png`);
				console.info("File Removed: ", `build/temp/chart-${globalUUID}.png`);
			} catch (err) {
				submitError(err, c);
			}

			await wait(1000);
			if (killer["dataValues"].id === vote.id) {
				await gameChannel.send({
					embeds: [new EmbedBuilder({
						title: "Sounds like you found the guilty.\nLet\"s give\"em our all!\nIt\"s punishment time!",
						color: 10038562,
						image: {
							url: "attachment://SPOILER_Punishment.gif"
						}
					})],
					files: [new AttachmentBuilder(`build/resources/punishment/${sortRandomImages("punishment")}`, {name: "SPOILER_Punishment.gif"})]
				});
				await killer.update({
					isKiller: false,
					gameServer: null,
					caught: killer["dataValues"].caught + 1
				});
			} else {
				await gameChannel.send({
					embeds: [new EmbedBuilder({
						title: "Sounds like you were wrong...\nNow you\"ll receive the ultimate punishment!",
						color: 10038562,
						description: `The killer was: ${i.guild?.members.cache.get(killer["dataValues"].id)}`,
						footer: {
							text: "I can\"t spoiler embed images :)" 
						}
					})],
					files: [new AttachmentBuilder(`build/resources/punishment/${sortRandomImages("punishment")}`, {name: "SPOILER_Punishment.gif"})]
				});
				await killer.update({
					isKiller: false,
					gameServer: null,
					sucKill: killer["dataValues"].sucKill + 1	
				});
			}
			await victim.update({
				isVictim: false,
				gameServer: null,
				victim: victim["dataValues"].victim + 1
			});
			return i.editReply({
				content: "Voting has concluded."
			});
		} catch (e) {
			await config.update({
				hasGame: true,
				started: true,
				isVoting: false,
				votedKillers: null
			});
			return submitError(e, c);
		}
	}
};

function getMaxNum(array: any[]) {
	const amountVoted: any[] = [];
	array.forEach((vote: { voters: string | any[]; }) => {
		amountVoted.push(vote.voters.length);
	});
	const num = Math.max.apply(null, amountVoted);
	const final: any[] = [];
	array.forEach((vote: { voters: string | any[]; }) => {
		if (vote.voters.length == num) {
			final.push(vote);
		}
	});
	return final;
}

function getData(jsondata: any[]) {
	const data: {user:string, votes: number}[] = [];
	jsondata.forEach((column: { name: any; voters: string | any[]; }) => {
		data.push({"user": column.name, "votes": column.voters.length});
	});
	return data;
}

// TODO: yank the stupid fucking makeChart function
async function makeChart(JSON: any) {
	const tempUUID = randomUUID();
	globalUUID = tempUUID;
	const data = getData(JSON);
	const config: Spec = {
		"$schema": "https://vega.github.io/schema/vega/v5.json",
		"width": 300,
		"height": 300,
		"padding": 10,
		"background": "#202020",
		"data": [
			{
				"name": "table",
				"values": data
			}
		],
		"scales": [
			{
				"name": "xscale",
				"type": "band",
				"domain": {"data": "table", "field": "user"},
				"range": "width",
				"padding": 0.1,
				"round": true
			},
			{
				"name": "yscale",
				"domain": {"data": "table", "field": "votes"},
				"nice": true,
				"range": "height"
			}
		],
		"axes": [
			{ "orient": "bottom", "scale": "xscale", "labelColor": "#C9C9C9", "domain": false, "ticks": false},
			{ "orient": "left", "scale": "yscale", "labelColor": "#B6B6B6", "title": "Votes", "titleColor": "#C9C9C9", "domain": false }
		],
		"marks": [
			{
				"type": "rect",
				"from": {"data":"table"},
				"encode": {
					"enter": {
						"x": {"scale": "xscale", "field": "user"},
						"width": {"scale": "xscale", "band": 1},
						"y": {"scale": "yscale", "field": "votes"},
						"y2": {"scale": "yscale", "value": 0}
					},
					"update": {
						"fill": {
							"value": "rgba(167, 26, 26, 0.75)"
						},
						"cornerRadius": [{"value": 3}]
					}
				}
			}
		]
	};

	try {
		const view = new View(parse(config), {renderer: "none"});
	
		await view.toSVG().then(async function (svg: any) {
			sharp(Buffer.from(svg)).toFormat("png")
				.toFile(`./build/temp/chart-${tempUUID}.png`, (err: any) => {
					if (err) throw console.error(err);
				});
		}).catch(function(err) {
			console.error(err);
		});
	} catch (err) {
		return console.error(err);
	}
}