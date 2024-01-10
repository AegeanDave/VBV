import expressLoader from './express'
import Logger from './logger'

export default async (expressApp: any) => {
	expressLoader(expressApp)
	Logger.info('✌️ Express loaded')
}
export { Logger }
