import { Router, Request, Response } from 'express'
import Warehouse from '../../../models/warehouse'
const route = Router()
import { query, Logger } from '../../../services'
import multiparty from 'multiparty'
import { disableWholeProductLine } from '../product'
import {
	isAuthenticated,
	myOpenId,
	adminAuthenticated,
	myWarehouseId
} from '../../../api/middleware/authorization'
import { queryName } from '../../../services/queryName'
import { Session, Product, WarehouseProduct } from '../../../models'
import {
	Status,
	WarehouseStatus,
	carriers,
	countryCodes
} from '../../../constants'
import { myCache } from '../../../provider/cache'
import { v4 as uuidv4 } from 'uuid'
import { sentShippingMessage, makeVerificationCode } from '../../../provider'
import { upload, downloadFile } from '../../../provider/fileAction'
import { sendRegistrationSMS, handleVerify } from '../../../provider/twilio'

const holdOriginalProduct = (product: Product) => {
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
	app.use('/admin/warehouse', route)
	route.post('/getVerificationCode', async (req: Request, res: Response) => {
		const { phoneNumber } = req.body
		try {
			const todoWarehouse = await Warehouse.findOne({
				where: {
					loginPhoneNumber: phoneNumber
				}
			})
			console.log(todoWarehouse.dataValues)
			if (!todoWarehouse) {
				res.send({
					status: Status.FAIL,
					message: '账户不存在，请前往微帮微小程序申请注册仓库'
				})
				return
			}
			const { dataValues } = todoWarehouse
			if (dataValues.status === 'Inactive') {
				res.send({
					status: Status.FAIL,
					message: '此账户已被关闭，再次开通请联系管理人员'
				})
				return
			}
			if (dataValues.status === 'Active') {
				res.send({
					status: Status.FAIL,
					message: '此手机号已被绑定'
				})
				return
			}
			const smsResult = await sendRegistrationSMS(phoneNumber)
			if (smsResult.errorCode) {
				console.log(smsResult)
				res.send({
					status: Status.FAIL,
					message: '网络错误'
				})
				return
			}
			res.send({
				status: Status.SUCCESS
			})
		} catch (err) {
			console.log(err)
			res.send({
				status: Status.FAIL,
				message: '网络错误'
			})
		}
	})
	route.post('/verify', async (req: Request, res: Response) => {
		const { code, phoneNumber, password } = req.body
		try {
			const todoVerify = await handleVerify(phoneNumber, code)
			if (todoVerify.status !== 'approved') {
				res.send({
					status: Status.FAIL,
					message: '验证失败'
				})
				return
			}
			Warehouse.update(
				{ password, status: 'Active' },
				{ where: { loginPhoneNumber: phoneNumber } }
			)
			res.send({
				status: Status.SUCCESS
			})
		} catch (err) {
			console.log(err)
			res.send({
				status: Status.FAIL,
				message: '网络错误'
			})
		}
	})
	route.post('/login', async (req: Request, res: Response) => {
		const { phoneNumber, password: inputPass } = req.body
		const todoWarehouse = await Warehouse.findOne({
			where: {
				loginPhoneNumber: phoneNumber
			}
		})
		if (!todoWarehouse) {
			res.status(401).send({
				status: Status.FAIL,
				message: 'Did not sign up!'
			})
			return
		}
		const { openId, warehouseId, password, ...rest } = todoWarehouse.dataValues
		if (password === inputPass) {
			const sessionKey = uuidv4()
			const value: Session = {
				openId,
				warehouseId
			}
			myCache.set(sessionKey, value, 2592000)
			res.status(200).send({ sessionKey, ...rest })
			Logger.info('logged in')
		} else {
			res.status(401).send({
				status: Status.FAIL,
				message: 'Authorization fail!'
			})
			Logger.info('login fail')
		}
	})
	route.delete(
		'/logout',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { authorization } = req.headers
			const result = myCache.del(authorization)
			if (result === 1) {
				res.status(200).send({
					status: Status.SUCCESS,
					message: 'logout success'
				})
				Logger.info('logout success')
			} else {
				res.status(403).send({
					status: Status.FAIL,
					message: 'Authorization fail!'
				})
				Logger.info('logout fail')
			}
		}
	)
	route.post(
		'/newProduct',
		upload.array('productImages', 10),
		async (req: Request, res: Response) => {
			console.log(req.files)
			try {
				const form = new multiparty.Form()
				// form.parse(req, async (error, fields, files) => {
				// 	if (error) throw error
				// 	const { product } = fields
				// })
			} catch (error) {
				res.send({
					status: Status.FAIL,
					message: error
				})
			}
		}
	)

	route.post(
		'/createWarehouse',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const { phone, countryCode } = req.body
				await query(queryName.createWarehouse, [myOpenId, phone, countryCode])
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('warehouse created')
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
		'/myWarehouse',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const checkWarehouse = await query(queryName.checkWarehouse, [myOpenId])
			if (checkWarehouse.data.length === 0) {
				res.send({
					status: WarehouseStatus.NOT_REGISTERED
				})
				Logger.info('warehouse has not sign up')
			} else {
				const orderResult = await query(queryName.getWarehouseOrders, [
					myOpenId
				])
				const countryCode = checkWarehouse.data[0].loginPhoneNumberCountryCode
				checkWarehouse.data[0].loginPhoneNumberCountryCode =
					countryCode && countryCodes[countryCode].value
				res.send({
					status: WarehouseStatus.REGISTERED,
					data: {
						warehouse: checkWarehouse.data[0],
						order: orderResult.data
					}
				})
				Logger.info('warehouse products get')
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

	route.post(
		'/phoneVerification',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { verificationCode } = req.body
			if (myCache.has(myWarehouseId)) {
				const cacheValue: {
					verificationCode: string
					tel: string
					countryCode: string
				} = myCache.get(myWarehouseId)
				if (cacheValue.verificationCode === verificationCode) {
					res.send({
						status: Status.SUCCESS
					})
					query(queryName.updatePhone, [
						cacheValue.tel,
						cacheValue.countryCode,
						myOpenId,
						myWarehouseId
					])
					myCache.del(myWarehouseId)

					Logger.info('verify success')
				} else {
					res.send({
						status: Status.FAIL,
						message: 'verificationCode Wrong'
					})
					Logger.info('verification code wrong')
				}
			} else {
				res.send({
					status: Status.FAIL
				})
				Logger.info('verify fail')
			}
		}
	)
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
