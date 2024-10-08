import { Router, Request, Response } from 'express'
import { Warehouse } from '../../../models/sequelize'
const route = Router()
import { Logger } from '../../../services'
import { adminAuthenticated } from '../../../api/middleware/authorization'
import { Session } from '../../../models/types'
import { Status } from '../../../constants'
import { myCache } from '../../../provider/cache'
import { v4 as uuidv4 } from 'uuid'
import { sendShippingSubscribeMessage } from '../../../provider'
import { sendRegistrationSMS, handleVerify } from '../../../provider/twilio'
import bcrypt from 'bcrypt'

const saltRounds = 10

export default (app: Router) => {
	app.use('/admin/warehouse', route)
	route.post('/verification-code', async (req: Request, res: Response) => {
		const { phoneNumber } = req.body
		try {
			const todoWarehouse = await Warehouse.findOne({
				where: {
					loginPhoneNumber: phoneNumber
				}
			})
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
					message: '发送失败，请检查手机号'
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
		const { verificationCode, phoneNumber, countryCode, password } = req.body
		try {
			const todoVerify = await handleVerify(
				countryCode + phoneNumber,
				verificationCode
			)
			if (todoVerify.status !== 'approved') {
				res.send({
					status: Status.FAIL,
					message: '验证失败'
				})
				return
			}
			bcrypt.hash(password, saltRounds, (err, hash) => {
				Warehouse.update(
					{ password: hash, status: 'Active' },
					{ where: { loginPhoneNumber: countryCode + phoneNumber } }
				)
			})
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
		try {
			const todoWarehouse = await Warehouse.findOne({
				where: {
					loginPhoneNumber: phoneNumber
				}
			})
			if (!todoWarehouse) {
				res.send({
					status: Status.FAIL,
					message: '此账号不存在'
				})
				return
			}
			const { openId, warehouseId, password, ...rest } =
				todoWarehouse.dataValues
			if (rest.status === 'Not_Verified') {
				res.send({
					status: Status.FAIL,
					message: '此帐号还未完成注册，请前往注册页面完成注册'
				})
				return
			}
			if (rest.status === 'Inactive') {
				res.status(200).send({
					status: Status.FAIL,
					message: '此账号已关闭'
				})
				return
			}
			const match = await bcrypt.compare(inputPass, password)

			if (match) {
				const sessionKey = uuidv4()
				const value: Session = {
					openId,
					warehouseId
				}
				myCache.set(sessionKey, value, 2592000)
				res.status(200).send({ sessionKey, ...rest })
				Logger.info('logged in')
			} else {
				res.status(200).send({
					status: Status.FAIL,
					message: '密码有误'
				})
				Logger.info('login fail')
			}
		} catch (err) {
			res.status(500).send({
				status: Status.FAIL
			})
			Logger.info('Internal error')
		}
	})
	route.delete(
		'/logout',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { authorization } = req.headers
			try {
				authorization && myCache.del(authorization)
				res.status(200).send({
					status: Status.SUCCESS,
					message: 'logout success'
				})
				Logger.info('logout success')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL,
					message: 'Authorization fail!'
				})
				Logger.info('logout fail')
			}
		}
	)
	route.post(
		'/secondary/verification-code',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { phoneNumber } = req.body
			try {
				const smsResult = await sendRegistrationSMS(phoneNumber)
				if (smsResult.errorCode) {
					res.send({
						status: Status.FAIL,
						message: '发送失败，请检查手机号'
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
		}
	)
	route.post(
		'/secondary/verify',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { verificationCode, phoneNumber, areaCode } = req.body
			const { myOpenId } = req.params

			try {
				const todoVerify = await handleVerify(
					areaCode + phoneNumber,
					verificationCode
				)
				if (todoVerify.status !== 'approved') {
					return res.send({
						status: Status.FAIL,
						message: '验证失败'
					})
				}
				await Warehouse.update(
					{ secondaryPhoneNumber: areaCode + phoneNumber },
					{ where: { openId: myOpenId } }
				)
				res.send({
					status: Status.SUCCESS
				})
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL,
					message: '网络错误'
				})
			}
		}
	)
	// route.post(
	// 	'/updateSale',
	// 	adminAuthenticated,
	// 	async (req: Request, res: Response) => {
	// 		const { product, action } = req.body
	// 		let queryResult
	// 		if (action === 'RELEASE') {
	// 			queryResult = await query(queryName.releaseProduct, [
	// 				product.price,
	// 				product.saleId
	// 			])
	// 			if (queryResult.count === 1) {
	// 				res.send({
	// 					status: 'SUCCESS'
	// 				})
	// 				Logger.info('release success')
	// 			} else {
	// 				res.send({
	// 					status: 'FAIL'
	// 				})
	// 				Logger.info('unrelease fail')
	// 			}
	// 		} else if (action === 'UNRELEASE') {
	// 			queryResult = await query(queryName.discontinueMySaleProduct, [
	// 				product.saleId
	// 			])
	// 			if (queryResult.count === 1) {
	// 				disableWholeProductLine(myOpenId, product.productId)
	// 				res.send({
	// 					status: 'SUCCESS'
	// 				})
	// 				Logger.info('unrelease success')
	// 			} else {
	// 				res.send({
	// 					status: 'FAIL'
	// 				})
	// 				Logger.info('unrelease fail')
	// 			}
	// 		} else if (action === 'DELETE') {
	// 			queryResult = await query(queryName.onHoldProduct, [product.productId])
	// 			if (queryResult.count === 1) {
	// 				disableWholeProductLine(myOpenId, product.productId)
	// 				res.send({
	// 					status: 'SUCCESS'
	// 				})
	// 				Logger.info('delete success')
	// 			} else {
	// 				res.send({
	// 					status: 'FAIL'
	// 				})
	// 				Logger.info('delete fail')
	// 			}
	// 		} else {
	// 			res.send({
	// 				status: Status.FAIL
	// 			})
	// 		}
	// 	}
	// )

	// route.post(
	// 	'/updateSetting',
	// 	adminAuthenticated,
	// 	async (req: Request, res: Response) => {
	// 		const { smsService, emailService } = req.body
	// 		try {
	// 			await query(queryName.updateSetting, [
	// 				smsService,
	// 				emailService,
	// 				myOpenId
	// 			])
	// 			res.send({
	// 				status: Status.SUCCESS
	// 			})
	// 			Logger.info('setting updated success')
	// 		} catch (err) {
	// 			res.send({
	// 				status: Status.FAIL,
	// 				message: err
	// 			})
	// 			Logger.info('setting updated fail')
	// 		}
	// 	}
	// )
}
