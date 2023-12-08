import { Request, Response, NextFunction } from 'express'
import { Session } from '../../models/types/index'
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
	if (!checkSessionResult) {
		res
			.status(403)
			.send({ status: Status.FAIL, message: 'Authorization fail!' })
		return
	}
	myOpenId = checkSessionResult
	return next()
}

export const adminAuthenticated = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const sessionKey = req.headers.authorization
	if (!sessionKey) {
		res.status(403).send('Authorization fail!')
		return
	}
	const checkSessionResult: Session = myCache.get(sessionKey)

	if (!checkSessionResult) {
		res.status(403).send('Authorization fail!')
		return
	}
	req.params.myOpenId = checkSessionResult.openId
	req.params.myWarehouseId = checkSessionResult.warehouseId
	return next()
}
