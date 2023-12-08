import config from './config'
import express from 'express'
import Logger from './services/logger'
import db from './config/database'

async function startServer() {
	const app = express()
	/**
	 * A little hack here
	 * Import/Export can only be used in 'top-level code'
	 * Well, at least in node 10 without babel and at the time of writing
	 * So we are using good old require.
	 */
	await require('./loaders').default({ expressApp: app })
	db.sync({ alter: process.env.NODE_ENV === 'dev' })
		.then(() => {
			console.log('All table created')
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
}

export default startServer()
