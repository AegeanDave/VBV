import { Request, Response, NextFunction } from 'express'
import { Session } from '../../models/index'
import { Status } from '../../constants'
import { myCache } from '../../provider/cache'

export let myOpenId: string
export let myWarehouseId: string

export const isAuthenticated = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const sessionKey = req.headers.authorization
	const checkSessionResult: string = myCache.get(sessionKey)
	if (checkSessionResult) {
		myOpenId = checkSessionResult
		return next()
	} else {
		res
			.status(403)
			.send({ status: Status.FAIL, message: 'Authorization fail!' })
	}
}

export const adminAuthenticated = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const sessionKey = req.headers.authorization
	if (sessionKey) {
		const checkSessionResult: Session = myCache.get(sessionKey)
		if (checkSessionResult) {
			myOpenId = checkSessionResult.openId
			myWarehouseId = checkSessionResult.warehouseId
			return next()
		} else {
			res.status(403).send('Authorization fail!')
		}
	} else {
		res.status(403).send('Authorization fail!')
	}
}
