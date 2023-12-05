import { Sequelize } from 'sequelize'

export default new Sequelize(process.env.DATABASE_URL, {
	host: process.env.DB_HOST,
	dialect: 'postgres',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
})
