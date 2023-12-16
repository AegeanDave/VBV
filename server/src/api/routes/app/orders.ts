import { Router, Request, Response } from 'express'
import { Product, OrderProduct, SubOrder } from '../../../models/types/index'
import { Status, countryCodes, OrderStatus } from '../../../constants'
import { query, Logger } from '../../../services'
import { queryName } from '../../../services/queryName'
import { isAuthenticated, myOpenId } from '../../middleware/authorization'
import wechatPay from '../../../provider/weChatPay'
import { v4 as uuidv4 } from 'uuid'
import { sendNewOrderSMS } from '../../../provider/twilio'
import { makeOrderNumber, sendSubscribeMessage } from '../../../provider/index'
import { newOrderMail } from '../../../provider/mailer'
import moment from 'moment-timezone'
import {
	Address,
	Order,
	OrderDetail,
	StoreProduct,
	User
} from '../../../models/sequelize'
import { Op } from 'sequelize'
import db from '../../../config/database'

const route = Router()

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

const handleSendNewOrderMessage = async (
	openId: string,
	originalOrderId: string
) => {
	const getEmailInfo = await query(queryName.getMailerUserInfo, [
		openId,
		originalOrderId
	])
	if (getEmailInfo.data) {
		if (getEmailInfo.data[0].emailService) {
			newOrderMail(
				getEmailInfo.data[0].email,
				moment().format('lll'),
				getEmailInfo.data[0].name
			)
		} else if (getEmailInfo.data[0].smsService) {
			const countryCode = getEmailInfo.data[0].countryCode
			sendNewOrderSMS(
				countryCodes[countryCode].value + getEmailInfo.data[0].phone
			)
		}
	}
}

export default (app: Router) => {
	app.use('/orders', route)

	route.post(
		'/myOrderFromFather',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const openIDFather = req.body.openID
			const queryResult = await query(queryName.getOrdersFromFather, [
				myOpenId,
				openIDFather
			])
			if (queryResult.data) {
				res.send({
					status: Status.SUCCESS,
					data: queryResult.data
				})
				Logger.info('Father orders get')
			} else {
				res.send({
					status: Status.FAIL
				})
			}
		}
	)
	route.post(
		'/myOrderFromChild',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const openIDChild = req.body.openID
			const queryResult = await query(queryName.getOrdersFromChild, [
				myOpenId,
				openIDChild
			])
			if (queryResult.data) {
				res.send({
					status: Status.SUCCESS,
					data: queryResult.data
				})
				Logger.info('child orders get')
			} else {
				res.send({
					status: Status.FAIL
				})
			}
		}
	)
	route.get(
		'/all-sold',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoOrder = await Order.findAll({
					where: {
						dealerId: myOpenId
					},
					group: 'orderName',
					include: [
						OrderDetail,
						Address,
						{ model: User, attributes: ['username', 'avatarUrl'] }
					]
				})

				res.send(todoOrder)
				Logger.info('Sold orders got')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL
				})
				Logger.info('Sold orders fetch failed')
			}
		}
	)
	route.get(
		'/all-purchased',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params

			try {
				const todoOrders = await Order.findAll({
					where: {
						userId: myOpenId
					},
					include: [OrderDetail, Address]
				})
				res.send(todoOrders)
				Logger.info('purchased orders get')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL,
					message: '获取失败'
				})
				Logger.info('orders fail')
			}
		}
	)

	route.post('/new', isAuthenticated, async (req: Request, res: Response) => {
		const groupId = uuidv4()
		const { items, addressId, comment } = req.body
		try {
			const todoStoreProducts = await StoreProduct.findAll({
				where: {
					id: {
						[Op.or]: items.map(
							(item: { id: string; quantity: number }) => item.id
						)
					}
				}
			})
			if (items.length !== todoStoreProducts.length) {
				Logger.info('orders fail')
				return res.send({
					status: Status.FAIL,
					message: '创建失败'
				})
			}
			const orderNumber = makeOrderNumber()

			const orderData: any = []
			todoStoreProducts.forEach(({ dataValues }) => {
				const index = orderData.findIndex(
					(element: any) => element.dealerId! === dataValues.openId
				)
				const quantity = items.find(
					(item: any) => item.id === dataValues.id
				).quantity
				const orderDetail = {
					productInfo: dataValues,
					productId: dataValues.productId,
					quantity,
					comment,
					subtotal: quantity * dataValues.defaultPrice
				}
				if (index === -1) {
					orderData.push({
						orderNumber,
						groupId,
						userId: myOpenId,
						dealerId: dataValues.openId,
						addressId,
						comment,
						status: 'Unpaid',
						orderDetails: [orderDetail]
					})
				} else {
					orderData[index].orderDetails?.push(orderDetail)
				}
			})
			await Order.bulkCreate(orderData, {
				include: [OrderDetail]
			})
			res.send()
			Logger.info('Order create successfully')
		} catch (err) {
			res.status(500).send({
				status: Status.FAIL,
				message: '创建失败'
			})
			Logger.info('Order create fail')
		}
	})
	route.post(
		'/mark-paid',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { order } = req.body
			const t = await db.transaction()
			try {
				const todoOrderDetails = await OrderDetail.findAll({
					where: { orderId: order.id }
				})

				const todoOrder = await Order.update(
					{ status: 'paid' },
					{ where: { id: order.id }, transaction: t }
				)
				const orderData = []

				const todoOrders = await Order.create()

				await t.commit()
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Success sign to paid and transfer to father')
			} catch (error) {
				await t.rollback()
				res.send({
					status: Status.FAIL,
					message: error
				})
				Logger.info('mark fail')
			}
		}
	)
	route.post(
		'/cancel',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { order } = req.body
			try {
				await Order.update({ status: 'Cancel' }, { where: { id: order.id } })
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('order cancel successfully')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('Cancel order failed')
			}
		}
	)
	route.post(
		'/hideOrder',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { order } = req.body
			try {
				await query(queryName.hideOrder, [order.orderId])
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('hide order success')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('hide order fail')
			}
		}
	)
	route.post(
		'/preOrder',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const preOrderResult = await wechatPay(req, myOpenId)
			res.send(preOrderResult)
			Logger.info('preOrder success')
		}
	)
}
