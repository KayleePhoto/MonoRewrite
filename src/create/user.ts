import { Model, DataTypes } from "sequelize";
import { dbConnect } from "../secrets/connect";

export class UserDB extends Model {}

UserDB.init({
	id: {
		type: DataTypes.STRING(30),
		primaryKey: true,
		allowNull: false
	},
	sucKill: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	victim: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	caught: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	isKiller: {
		type: DataTypes.TINYINT({length: 1}),
		defaultValue: 0
	},	
	isVictim: {
		type: DataTypes.TINYINT({length: 1}),
		defaultValue: 0
	},
	gameServer: {
		type: DataTypes.STRING(30),
		allowNull: true
	}
},{
	sequelize: dbConnect,
	modelName: "user",
	freezeTableName: true,
	updatedAt: false,
	createdAt: false
});

export async function createUser(id: string, options: {isKiller: boolean, isVictim: boolean, gameServer: string | null}) {
	const user: any = new UserDB({
		id: id,
		isKiller: options.isKiller,
		isVictim: options.isVictim,
		gameServer: options.gameServer
	});
	await user.save();
}