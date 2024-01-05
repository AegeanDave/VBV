import { Request, Response, NextFunction } from 'express'
import { Session } from '../../models/types/index'
import { Status, RANDOM_TOKEN_SECRET } from '../../constants'
import { myCache } from '../../provider/cache'
import jwt from 'jsonwebtoken'

export const isAuthenticated = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { authorization } = req.headers
	if (!authorization) {
		return res
			.status(403)
			.send({ status: Status.FAIL, message: 'Authorization fail!' })
	}
	const checkSessionResult = jwt.verify(
		authorization,
		RANDOM_TOKEN_SECRET
	) as any
	console.log(checkSessionResult)
	if (!checkSessionResult) {
		res
			.status(403)
			.send({ status: Status.FAIL, message: 'Authorization fail!' })
		return
	}
	req.params.myOpenId = checkSessionResult.openId
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
	const checkSessionResult: Session | undefined = myCache.get(sessionKey)

	if (!checkSessionResult) {
		res.status(403).send('Authorization fail!')
		return
	}
	req.params.myOpenId = checkSessionResult.openId
	req.params.myWarehouseId = checkSessionResult.warehouseId
	return next()
}
