import { CacheType, ChatInputCommandInteraction, Client, GuildMember, SlashCommandBuilder, TextChannel } from "discord.js";
import { findUser, serverConfig, sortRandomImages, submitError } from "../functions";
import { Config } from "../create/config";
import { UserDB } from "../create/user";
import { randomUUID } from 'crypto';
import {setTimeout as wait} from "node:timers/promises";
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import * as fs from 'fs';

let globalUUID: string;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Begin the voting phase of the killing game.')
		.setDMPermission(false)
		.addUserOption((option) => 
			option.setName('target')
			.setDescription('The user you want to vote for as possible killer.')
			.setRequired(true)
		),
	async execute(i: ChatInputCommandInteraction<CacheType>, c: Client) {
		// ? Make neater? if possible?
		let killer = await findUser(i, c, {gameServer: i.guild?.id, isKiller: true}) as UserDB;
		let victim = await findUser(i, c, {gameServer: i.guild?.id, isVictim: true}) as UserDB;
		let voter = await findUser(i, c, {id: i.user.id}) as UserDB;
		const config = await serverConfig(i, c) as Config;
		const target = i.guild?.members.cache.get(i.options.getUser('target')?.id as string) as GuildMember;
		const gameChannel = i.guild?.channels.cache.get(config["dataValues"].channel) as TextChannel;

		if (config["dataValues"].started === false) {
			return i.reply({
				content: 'Please wait for the class trial to begin.',
				ephemeral: true
			});
		}
		if (voter["dataValues"].isVictim === true) {
			return i.reply({
				content: 'You are the victim, you are unable to vote.'
			});
		}
		
		if (config["dataValues"].isVoting === true) {
			return addVotesToPreexisting(config["dataValues"].votedKillers, target, i, config);
		}

		try {
			await i.deferReply({ ephemeral: true });
			await config.update({
				isVoting: true,
				votedKillers: [{
					id: target?.id,
					name: target?.displayName,
					voters: [i.user.id]
				}]
			});
			await gameChannel.send({
				content: 'The voting process has begun! You have 5 minutes to finalize!\nOnce you vote, you are locked in.\n*Use `/vote` to begin.*'
			});

			await wait(1000 * 60 * 2);
			await gameChannel.send({
				content: '3 minutes left to conclude your votes!\n**Remember! Once you vote, it is locked in!**'
			});
			await wait(1000 * 60 * 3);

			await config.update({
				isVoting: false,
				hasGame: false,
				started: false
			});

			let votedKillers = config["dataValues"].votedKillers;
			let votedUsers = getMaxNum(votedKillers);
			let vote;

			if (votedUsers.length > 1) {
				vote = votedUsers[Math.floor(Math.random() * votedUsers.length)];
			} else {
				vote = votedUsers[0];
			}

			await makeChart(votedKillers);
			await gameChannel.send({
				content: `The voting has concluded\n${
					votedUsers.length > 1
					? `There was a tie! Randomly selecting someone!\n${vote.name}`
					: vote.name
				} has been voted out...`,
				files: [{
					attachment: `src/temp/chart-${globalUUID}.png`,
					name: 'chart.png'
				}]
			});

			try {
				fs.unlinkSync(`src/temp/chart-${globalUUID}.png`);
				console.info('File Removed: ', `src/temp/chart-${globalUUID}.png`);
			} catch (err) {
				submitError(err, c);
			}

			await wait(1000);
			if (killer["dataValues"].id === vote.id) {
				await gameChannel.send({
					content: 'Sounds like you found the guilty.\n Let\'s give\'em our all!\nIt\'s punishment time!',
					files: [{
						attachment: `src/resources/punishment/${sortRandomImages('punishment')}`,
						name: 'SPOILER_Punishment.gif',
						description: 'This Killer\'s Punishment.'
					}]
				});
				await killer.update({
					isKiller: false,
					gameServer: null,
					caught: killer["dataValues"].caught + 1
				});
			} else {
				await gameChannel.send({
					content: `Seems like you were wrong... Now you'll receive the ultimate punishment!\nThe killer was: ${i.guild?.members.cache.get(killer["dataValues"].id)}`,
					files: [{
						attachment: `src/resources/punishment/${sortRandomImages('punishment')}`,
						name: "SPOILER_Punishment.gif",
						description: 'The Accuser\'s Punishment.'
					}]
				});
				await killer.update({
					isKiller: false,
					gameServer: null,
					sucKill: killer['dataValues'].sucKill + 1	
				});
			}
			await victim.update({
				isVictim: false,
				gameServer: null,
				victim: victim["dataValues"].victim + 1
			});
		} catch {
			await config.update({
				isVoting: false,
				hasGame: true,
				started: true,
				votedKillers: null
			});
		}
	}
}

// ? Fix list typing
async function addVotesToPreexisting(list: {name: string, id: string, voters: string[]}[], target: GuildMember, i: ChatInputCommandInteraction<CacheType>, c: Config) {
	list.forEach(async killer => {
		if (killer.voters.includes(i.user.id)) {
			return i.reply({
				content: `You have already voted.\nYou Voted for: **${killer.name}**`
			});
		}
		if (killer.id !== target.id) {
			list.push({
				id: target.id,
				name: target.displayName,
				voters: [i.user.id]
			});
		}
		list[list.indexOf(killer)].voters.push(i.user.id);
		await c.update({
			votedKillers: list
		});
		return i.reply({
			content: `Your vote is locked in!\nYou voted for **${target.displayName}**`,
			ephemeral: true
		});
	});
}

function getMaxNum(array: any[]) {
	let amountVoted: any[] = [];
	array.forEach((vote: { voters: string | any[]; }) => {
		amountVoted.push(vote.voters.length);
	});
	let num = Math.max.apply(Math, amountVoted);
	let final: any[] = [];
	array.forEach((vote: { voters: string | any[]; }) => {
		if (vote.voters.length == num) {
			final.push(vote);
		}
	});
	return final;
}

function getData(jsondata: any[]) {
	const xs: any[] = [];
	const ys: any[] = [];
	jsondata.forEach((column: { name: any; voters: string | any[]; }) => {
		xs.push(column.name);
		ys.push(column.voters.length);
	});

	return { xs, ys };
}

// TODO: yank the stupid fucking makeChart function
async function makeChart(JSON: any) {
	const tempUUID = randomUUID();
	const data = getData(JSON);
	const configuration: ChartConfiguration = {
		type: "bar",
		data: {
			labels: data.xs,
			datasets: [
				{
					label: "Test",
					data: data.ys,
					backgroundColor: "rgba(167, 26, 26, 0.75)",
					borderRadius: 10,
				},
			],
		},
		options: {
			layout: {
				padding: 10,
			},
			plugins: {
				legend: {
					display: false,
				},
				title: {
					display: true,
					text: "The Votes For the Assumed Killer",
					color: "#C9C9C9",
					font: {
						size: 40,
						weight: '50'
					},
				},
			},
			scales: {
				y: {
					title: {
						display: true,
						text: "Votes",
						color: "#C9C9C9",
						font: {
							size: 40,
							weight: '20'
						},
					},
					ticks: {
						font: {
							size: 35,
						},
					},
					beginAtZero: true,
				},
				x: {
					ticks: {
						font: {
							size: 40,
						},
						color: "#C9C9C9",
					},
				},
			},
		},
		plugins: [
			{
			id: "custom_canvas_background_color",
			beforeDraw: (chart: { width?: any; height?: any; ctx?: any; }) => {
				const { ctx } = chart;
				ctx.save();
				ctx.globalCompositeOperation = "destination-over";
				ctx.fillStyle = "#202020";
				ctx.fillRect(0, 0, chart.width, chart.height);
				ctx.restore();
				},
			},
		],
	};
	
	
	const chartCallback = (ChartJS: { defaults: { responsive: boolean; maintainAspectRatio: boolean; }; }) => {
	  ChartJS.defaults.responsive = true;
	  ChartJS.defaults.maintainAspectRatio = false;
	};
	const width = 1440, height = 1440;
	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
	const buffer = await chartJSNodeCanvas.renderToBuffer(configuration, 'image/png');
	fs.writeFile(`./src/temp/temp-${tempUUID}.png`, buffer, (err) => console.error(err));
	globalUUID = tempUUID;
}