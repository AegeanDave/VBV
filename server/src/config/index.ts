import dotenv from 'dotenv'
import fs from 'fs'

// Set the NODE_ENV to 'dev' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

const envFound = dotenv.config()
if (!envFound) {
	// This error should crash whole process
	throw new Error("⚠️  Couldn't find .env file  ⚠️")
}

// pools will use environment variables
// for connection information

// clients will also use environment variables
// for connection information

if (fs.existsSync('.env')) {
	dotenv.config({ path: '.env' })
} else {
	dotenv.config({ path: '.env.example' }) // you can delete this after you create your own .env file!
}
const PORT =
	process.env.STATUS === 'production'
		? process.env.PROD_PORT
		: process.env.DEV_PORT
export default {
	/**
	 * Your favorite port
	 */
	port: parseInt(PORT || '8080', 10),

	/**
	 * API configs
	 */
	api: {
		prefix: '/api'
	},

	/**
	 * Used by winston logger
	 */
	logs: {
		level: process.env.LOG_LEVEL || 'info'
	},

	test: {
		sessionSecret: process.env.SESSION_SECRET
	},

	dev: process.env.NODE_ENV === 'dev'
}
