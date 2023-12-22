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

	route.get(
		'/sold/all',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoUnpaidOrder = await Order.findAll({
					where: {
						dealerId: myOpenId,
						status: 'Unpaid'
					},
					include: [
						{ model: User, attributes: ['username', 'avatarUrl'] },
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						}
					]
				})

				const todoPaidOrder = await Order.findAll({
					where: {
						dealerId: myOpenId,
						status: { [Op.or]: ['Paid', 'Processing'] }
					},
					include: [
						{ model: User, attributes: ['username', 'avatarUrl'] },
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						}
					]
				})

				const todoCompleteOrder = await Order.findAll({
					where: {
						dealerId: myOpenId,
						status: { [Op.or]: ['Completed', 'Cancelled'] }
					},
					include: [
						{ model: User, attributes: ['username', 'avatarUrl'] },
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						}
					]
				})
				res.send({
					unpaid: todoUnpaidOrder,
					paid: todoPaidOrder,
					complete: todoCompleteOrder
				})
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
		'/purchase/all',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params

			try {
				const todoPendingOrders = Order.findAll({
					where: {
						userId: myOpenId,
						status: 'Unpaid'
					},
					include: [
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						}
					]
				})
				const todoProcessingOrders = Order.findAll({
					where: {
						userId: myOpenId,
						status: { [Op.or]: ['Paid', 'Completed', 'Shipped'] }
					},
					include: [
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						}
					]
				})

				const result = await Promise.all([
					todoPendingOrders,
					todoProcessingOrders
				])

				const unpaidOrders = Object.values(
					result[0].reduce((grouped: any, order) => {
						const key = order.dataValues.orderNumber

						if (!grouped[key]) {
							grouped[key] = []
						}
						const createdAt = moment(order.dataValues.creadtedAt).format(
							'MMMM Do YYYY'
						)
						grouped[key].push({ ...order.dataValues, createdAt })

						return grouped
					}, {})
				)

				const processingOrders = Object.values(
					result[1].reduce((grouped: any, order) => {
						const key = order.dataValues.orderNumber

						if (!grouped[key]) {
							grouped[key] = []
						}
						const createdAt = moment(order.dataValues.creadtedAt).format(
							'MMMM Do YYYY'
						)
						if (
							order.dataValues.status === 'Paid' ||
							order.dataValues.status === 'Complete' ||
							order.dataValues.status === 'Shipped'
						)
							grouped[key].push({ ...order.dataValues, createdAt })

						return grouped
					}, {})
				)
				res.send({
					unpaidOrders,
					processingOrders
				})
				Logger.info('purchased orders get')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL,
					message: '获取失败'
				})
				Logger.info('orders fail')
			}
		}
	)
	//ununsed
	// route.get(
	// 	'/purchase/:id',
	// 	isAuthenticated,
	// 	async (req: Request, res: Response) => {
	// 		const { myOpenId, id } = req.params

	// 		try {
	// 			const todoOrder = await Order.findOne({
	// 				where: {
	// 					userId: myOpenId,
	// 					id
	// 				},
	// 				include: [
	// 					{
	// 						model: OrderDetail,
	// 						attributes: ['productInfo', 'quantity', 'subtotal']
	// 					},
	// 					Address
	// 				]
	// 			})
	// 			res.send(todoOrder)
	// 			Logger.info('purchased order get')
	// 		} catch (err) {
	// 			console.log(err)
	// 			res.status(500).send({
	// 				status: Status.FAIL,
	// 				message: '获取失败'
	// 			})
	// 			Logger.info('purchased order fail')
	// 		}
	// 	}
	// )
	route.get(
		'/purchase-dealer',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { orderNumber, dealerId } = req.query
			const { myOpenId } = req.params

			try {
				const todoOrder = await Order.findOne({
					where: {
						userId: myOpenId,
						dealerId,
						orderNumber
					},
					include: [
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						},
						Address,
						{ model: User, as: 'dealer', attributes: ['username', 'avatarUrl'] }
					]
				})
				res.send(todoOrder)
				Logger.info('purchased order get')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL,
					message: '获取失败'
				})
				Logger.info('purchased order fail')
			}
		}
	)
	route.get(
		'/purchase',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { orderNumber } = req.query
			const { myOpenId } = req.params

			try {
				const todoOrder = await Order.findAll({
					where: {
						userId: myOpenId,
						orderNumber
					},
					include: [
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						},
						Address,
						{ model: User, as: 'dealer', attributes: ['username', 'avatarUrl'] }
					]
				})
				res.send(todoOrder)
				Logger.info('purchased order get')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL,
					message: '获取失败'
				})
				Logger.info('purchased order fail')
			}
		}
	)
	route.post('/new', isAuthenticated, async (req: Request, res: Response) => {
		const groupId = uuidv4()
		const { items, addressId, comment } = req.body
		const { myOpenId } = req.params
		try {
			const todoStoreProducts = await StoreProduct.findAll({
				where: {
					id: {
						[Op.or]: items.map(
							(item: { item: any; quantity: number }) => item.item.id
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
					(item: any) => item.item.id === dataValues.id
				).quantity
				const orderDetail = {
					productInfo: {
						price: dataValues.defaultPrice,
						coverImageUrl: dataValues.coverImageUrl,
						name: dataValues.name
					},
					productId: dataValues.productId,
					quantity,
					comment,
					groupId,
					subtotal: quantity * dataValues.defaultPrice
				}
				if (index === -1) {
					orderData.push({
						orderNumber,
						groupId,
						payment: {
							totalAmount: quantity * dataValues.defaultPrice
						},
						userId: myOpenId,
						dealerId: dataValues.openId,
						addressId,
						comment,
						status: 'Unpaid',
						orderDetails: [orderDetail]
					})
				} else {
					orderData[index].payment.totalAmount +=
						quantity * dataValues.defaultPrice
					orderData[index].orderDetails?.push(orderDetail)
				}
			})
			await Order.bulkCreate(orderData, {
				include: [OrderDetail]
			})
			res.send({ orderNumber })
			Logger.info('Order create successfully')
		} catch (err) {
			console.log(err)
			res.status(500).send({
				status: Status.FAIL,
				message: '创建失败'
			})
			Logger.info('Order create fail')
		}
	})

	route.get(
		'/contact',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { orderNumber } = req.query
			const { myOpenId } = req.params
			try {
				const todoOrder = await Order.findAll({
					where: { orderNumber, userId: myOpenId },
					attributes: ['payment', 'dealerId', 'status']
				})

				const todoDealer = await User.findAll({
					where: {
						openId: {
							[Op.or]: todoOrder.map(order => order.dataValues.dealerId)
						}
					},
					attributes: ['openId', 'username', 'avatarUrl']
				})
				const dealers = todoDealer.map(dealer => ({
					...dealer.dataValues,
					payment: todoOrder.find(
						order => order.dataValues.dealerId === dealer.dataValues.openId
					)
				}))
				res.send({ dealers })
				Logger.info('Order result and dealer info success')
			} catch (err) {
				console.log(err)
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('Order result and dealer info fail')
			}
		}
	)

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