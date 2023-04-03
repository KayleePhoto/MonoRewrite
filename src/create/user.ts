import { DataTypes, Model } from "sequelize";
import { dbConnect } from "../secrets/connect";

class User extends Model {}

User.init({
	id: {
		type: DataTypes.STRING(30),
		primaryKey: true,
		allowNull: false
	},
	balance: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		allowNull: false
	}
},{
	sequelize: dbConnect,
	modelName: "user",
	freezeTableName: true,
	updatedAt: false,
	createdAt: false
});

export { User };

export async function createUser(id: string) {
	const user = new User({
		id: id
	});
	await user.save();
}