import { Router, Request, Response } from 'express'
import { Order, Product, Warehouse } from '../../../models/sequelize'
const route = Router()
import { Logger } from '../../../services'
import { isAuthenticated } from '../../middleware/authorization'
import { Status } from '../../../constants'
import { Op } from 'sequelize'

export default (app: Router) => {
	app.use('/warehouse', route)

	route.post(
		'/create',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const { phoneNumber } = req.body
				const { myOpenId } = req.params
				const [_warehouse, created] = await Warehouse.findOrCreate({
					where: { openId: myOpenId, loginPhoneNumber: phoneNumber },
					defaults: {
						status: 'Not_Verified'
					}
				})
				if (!created) {
					Warehouse.update(
						{ status: 'Not_Verified', loginPhoneNumber: phoneNumber },
						{
							where: { openId: myOpenId }
						}
					)
				}
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Raw Warehouse created')
			} catch (error) {
				res.send({
					status: Status.FAIL,
					message: error
				})
				Logger.info('warehouse creadted fail')
			}
		}
	)
	route.get(
		'/my-warehouse',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoWarehouse = await Warehouse.findOne({
					where: { openId: myOpenId },
					attributes: {
						exclude: ['password', 'setting', 'secondaryPhoneNumber']
					},
					include: Product
				})
				const todoOrder = await Order.findAll({
					where: {
						dealerId: myOpenId,
						status: { [Op.or]: ['Paid', 'Processing'] }
					}
				})
				res.send({
					warehouse: todoWarehouse?.dataValues,
					orders: todoOrder
				})
				Logger.info('Warehouse get')
			} catch (err) {
				console.log(err)
				res.status(500).send()
				Logger.info('Catch warehouse fail')
			}
		}
	)
	// route.post(
	// 	'/updatePhone',
	// 	isAuthenticated,
	// 	async (req: Request, res: Response) => {
	// 		try {
	// 			const { phone, countryCode } = req.body
	// 			await query(queryName.updatePhoneAdmin, [phone, countryCode, myOpenId])
	// 			res.send({
	// 				status: Status.SUCCESS
	// 			})
	// 		} catch (error) {
	// 			res.send({
	// 				status: Status.FAIL,
	// 				message: error
	// 			})
	// 		}
	// 	}
	// )

	// route.post(
	// 	'/phoneVerification',
	// 	adminAuthenticated,
	// 	async (req: Request, res: Response) => {
	// 		const { verificationCode } = req.body
	// 		if (myCache.has(myWarehouseId)) {
	// 			const cacheValue: {
	// 				verificationCode: string
	// 				tel: string
	// 				countryCode: string
	// 			} = myCache.get(myWarehouseId)
	// 			if (cacheValue.verificationCode === verificationCode) {
	// 				res.send({
	// 					status: Status.SUCCESS
	// 				})
	// 				query(queryName.updatePhone, [
	// 					cacheValue.tel,
	// 					cacheValue.countryCode,
	// 					myOpenId,
	// 					myWarehouseId
	// 				])
	// 				myCache.del(myWarehouseId)

	// 				Logger.info('verify success')
	// 			} else {
	// 				res.send({
	// 					status: Status.FAIL,
	// 					message: 'verificationCode Wrong'
	// 				})
	// 				Logger.info('verification code wrong')
	// 			}
	// 		} else {
	// 			res.send({
	// 				status: Status.FAIL
	// 			})
	// 			Logger.info('verify fail')
	// 		}
	// 	}
	// )
}
