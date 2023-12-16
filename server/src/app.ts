import config from './config'
import express, { Express } from 'express'
import Logger from './services/logger'
import db from './config/database'
import loader from './services/index'

const app: Express = express()

db.sync({ alter: process.env.NODE_ENV === 'dev' })
	.then(() => {
		console.log('All table created')
		loader({ expressApp: app })
		app.listen(config.port, () => {
			Logger.info(`
				################################################
				🛡️  Server listening on port: ${config.port} env: ${process.env.NODE_ENV} 🛡️
				################################################
			  `)
		})
	})
	.catch(error => {
		console.error('Error syncing models:', error)
	})
