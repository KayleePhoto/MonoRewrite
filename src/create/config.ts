import { Model, DataTypes } from "sequelize";
import { dbConnect } from "../secrets/connect";

export class Config extends Model {}

Config.init({
	server: {
		type: DataTypes.STRING(30),
		primaryKey: true,
		allowNull: false
	},
	channel: {
		type: DataTypes.STRING(30),
		allowNull: true
	},
	role: {
		type: DataTypes.STRING(30),
		allowNull: true
	},
	pingable: {
		type: DataTypes.TINYINT({length: 1}),
		defaultValue: 1,
		allowNull: false
	},
	hasGame: {
		type: DataTypes.TINYINT({length: 1}),
		defaultValue: 0,
		allowNull: false
	},
	started: {
		type: DataTypes.TINYINT({length: 1}),
		defaultValue: 0,
		allowNull: false
	},
	isVoting: {
		type: DataTypes.TINYINT({length: 1}),
		defaultValue: 0,
		allowNull: false
	},
	votedKillers: {
		type: DataTypes.JSON,
		allowNull: true
	}
}, {sequelize: dbConnect, modelName: "config", createdAt: false, updatedAt: false, freezeTableName: true});

export async function createConfig(server: string) {
	const config: any = new Config({
		server: server
	});
	await config.save();
}