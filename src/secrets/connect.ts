import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
config({ path: __dirname + '/.env' });

export const dbConnect = new Sequelize(
	process.env.dbName as string,
	process.env.dbUser as string,
	process.env.dbPass as string,
	{
		host: process.env.host as string,
		dialect: 'mysql',

		pool: {
			max: 5,
			min: 0,
			idle: 1000
		},
		logging: false
	}
);