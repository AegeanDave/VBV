import config from './config'
import express, { Express } from 'express'
import Logger from './services/logger'
import db from './config/database'
import loader from './services/index'

const https = require('https')
const fs = require('fs')

const app: Express = express()
loader(app)

const credentials = {
	key: fs.readFileSync('private.key', 'utf8'),
	cert: fs.readFileSync('certificate.crt', 'utf8'),
	ca: fs.readFileSync('ca_bundle.crt', 'utf8')
}

https.createServer(credentials, app).listen(config.port, () => {
	db.sync({ alter: process.env.NODE_ENV === 'dev' })
		.then(() => {
			console.log('All table created')
			Logger.info(`
		################################################
		🛡️  HTTPS Server listening on port: ${config.port} env: ${process.env.NODE_ENV} 🛡️
		################################################
	  `)
		})
		.catch(error => {
			console.error('Error syncing models:', error)
		})
})
