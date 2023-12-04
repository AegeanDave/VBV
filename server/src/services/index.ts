import expressLoader from './express'
import Logger from './logger'
import query from './db'

export default async ({ expressApp }: any) => {
	expressLoader({ app: expressApp })
	Logger.info('✌️ Express loaded')
}
export { query, Logger }
