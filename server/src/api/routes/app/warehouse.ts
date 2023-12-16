import { Router, Request, Response } from 'express'
import db from '../../../config/database'
import { Order, Product, Warehouse } from '../../../models/sequelize'
const route = Router()
import { query, Logger } from '../../../services'
import { disableWholeProductLine } from './product'
import {
	isAuthenticated,
	myOpenId,
	adminAuthenticated,
	myWarehouseId
} from '../../middleware/authorization'
import { queryName } from '../../../services/queryName'
import {
	Session,
	Product as ProductType,
	WarehouseProduct
} from '../../../models/types'
import {
	Status,
	WarehouseStatus,
	carriers,
	countryCodes
} from '../../../constants'
import { myCache } from '../../../provider/cache'
import { v4 as uuidv4 } from 'uuid'
import { sentShippingMessage } from '../../../provider'
import { upload, downloadFile } from '../../../provider/fileAction'
import { sendRegistrationSMS } from '../../../provider/twilio'

const holdOriginalProduct = (product: ProductType) => {
	query(queryName.onHoldProduct, [product.productId])
	disableWholeProductLine(myOpenId, product.productId)
}

const handleUnitMessage = async (
	orderNumber: string,
	trackingNumber: string,
	trackingCompany: string,
	originalOrderID: string
) => {
	const openIDResult = await query(queryName.allChildrenInOrder, [
		originalOrderID
	])
	if (openIDResult.data.length > 0)
		openIDResult.data.forEach((openIDItem: { [key: string]: string }) => {
			sentShippingMessage(
				orderNumber,
				trackingNumber,
				carriers[trackingCompany].label,
				openIDItem.openIDChild
			)
		})
}

const createNewProduct = async (product: WarehouseProduct) => {
	const newProductResult = await query(queryName.newProduct, [
		myOpenId,
		product.productName,
		product.productDescription,
		product.coverImageURL,
		product.freeShipping,
		product.idCardRequired
	])
	if (newProductResult.data[0]) {
		const newSaleResult = await query(queryName.releaseNewProduct, [
			newProductResult.data[0].productId,
			myOpenId,
			myOpenId,
			product.price
		])
		for (const image of product.images) {
			query(queryName.insertImage, [
				newProductResult.data[0].productId,
				image.url,
				product.images.indexOf(image)
			])
		}
		if (newSaleResult.count === 1) {
			return newProductResult.data[0].productId
		}
		return false
	}
}

export default (app: Router) => {
	app.use('/warehouse', route)

	route.post(
		'/create',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const { phoneNumber } = req.body
				const { myOpenId } = req.params
				await Warehouse.create({
					openId: myOpenId,
					loginPhoneNumber: phoneNumber,
					status: 'Not_Verified'
				})
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
						status: 'Processing'
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
	route.post(
		'/updatePhone',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const { phone, countryCode } = req.body
				await query(queryName.updatePhoneAdmin, [phone, countryCode, myOpenId])
				res.send({
					status: Status.SUCCESS
				})
			} catch (error) {
				res.send({
					status: Status.FAIL,
					message: error
				})
			}
		}
	)
	route.get(
		'/myWarehouseProducts',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const result = await query(queryName.getWarehouseProductsById, [
				myOpenId,
				myWarehouseId
			])
			res.status(200).send(result.data)
			Logger.info('warehouse products get')
		}
	)

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
	route.get(
		'/allSaleOrders',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const queryResult = await query(queryName.getWarehouseOrders, [myOpenId])
			if (queryResult.data) {
				res.send(queryResult.data)
				Logger.info('sale orders get')
			} else {
				res.send({
					status: Status.FAIL
				})
			}
		}
	)
	route.post(
		'/updateSale',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { product, action } = req.body
			let queryResult
			if (action === 'RELEASE') {
				queryResult = await query(queryName.releaseProduct, [
					product.price,
					product.saleId
				])
				if (queryResult.count === 1) {
					res.send({
						status: 'SUCCESS'
					})
					Logger.info('release success')
				} else {
					res.send({
						status: 'FAIL'
					})
					Logger.info('unrelease fail')
				}
			} else if (action === 'UNRELEASE') {
				queryResult = await query(queryName.discontinueMySaleProduct, [
					product.saleId
				])
				if (queryResult.count === 1) {
					disableWholeProductLine(myOpenId, product.productId)
					res.send({
						status: 'SUCCESS'
					})
					Logger.info('unrelease success')
				} else {
					res.send({
						status: 'FAIL'
					})
					Logger.info('unrelease fail')
				}
			} else if (action === 'DELETE') {
				queryResult = await query(queryName.onHoldProduct, [product.productId])
				if (queryResult.count === 1) {
					disableWholeProductLine(myOpenId, product.productId)
					res.send({
						status: 'SUCCESS'
					})
					Logger.info('delete success')
				} else {
					res.send({
						status: 'FAIL'
					})
					Logger.info('delete fail')
				}
			} else {
				res.send({
					status: Status.FAIL
				})
			}
		}
	)
	route.post(
		'/updateOrder',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { order, action } = req.body
			try {
				if (action === 'REJECT') {
					for (const product of order.orderProducts) {
						query(queryName.cancelOrderDetailByWarehouse, [
							order.originOrderId,
							product.productId
						])
					}
					res.send({
						status: 'SUCCESS'
					})
					Logger.info('order update success')
				} else if (action === 'SHIP' || action === 'EDIT') {
					const params: string[] = [
						order.company,
						order.trackingNumber,
						order.originOrderId
					]
					for (const product of order.orderProducts) {
						params[3] = product.productId
						action === 'SHIP'
							? query(queryName.updateTrackingToShipping, params)
							: query(queryName.updateTrackingInfo, params)
					}
					handleUnitMessage(
						order.orderNumber,
						order.trackingNumber,
						order.company,
						order.originOrderId
					)
					res.send({
						status: Status.SUCCESS
					})
					Logger.info('order update success')
				}
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('order update fail')
			}
		}
	)
	route.get(
		'/download',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { url } = req.query
			try {
				const file = await downloadFile(url as string)
				res.status(200).send(file)
				Logger.info('file downloaded')
			} catch (err) {
				res.status(404).send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('file download fail')
			}
		}
	)
	route.post(
		'/updateSetting',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { smsService, emailService } = req.body
			try {
				await query(queryName.updateSetting, [
					smsService,
					emailService,
					myOpenId
				])
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('setting updated success')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('setting updated fail')
			}
		}
	)
}
