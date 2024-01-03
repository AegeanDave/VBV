import { Router, Request, Response } from 'express'
import { Status, countryCodes, OrderStatus } from '../../../constants'
import { Logger } from '../../../services'
import { isAuthenticated } from '../../middleware/authorization'
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
	Price,
	Product,
	StoreProduct,
	User
} from '../../../models/sequelize'
import { Op } from 'sequelize'
import db from '../../../config/database'

const route = Router()

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

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
							attributes: [
								'productInfo',
								'quantity',
								'subtotal',
								'comment',
								'shipment',
								'status'
							]
						}
					]
				})

				const todoPaidOrder = await Order.findAll({
					where: {
						dealerId: myOpenId,
						status: { [Op.or]: ['Paid', 'Processing', 'Shipped'] }
					},
					include: [
						{ model: User, attributes: ['username', 'avatarUrl'] },
						{
							model: OrderDetail,
							attributes: [
								'productInfo',
								'quantity',
								'subtotal',
								'comment',
								'shipment',
								'status'
							]
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
							attributes: [
								'productInfo',
								'quantity',
								'subtotal',
								'shipment',
								'comment',
								'status'
							]
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
		'/sold-customer',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { orderNumber, customerId } = req.query
			const { myOpenId } = req.params

			try {
				const todoOrder = await Order.findOne({
					where: {
						dealerId: myOpenId,
						userId: customerId,
						orderNumber
					},
					include: [
						{
							model: OrderDetail,
							attributes: [
								'productInfo',
								'quantity',
								'subtotal',
								'comment',
								'status',
								'shipment'
							]
						},
						{
							model: User,
							as: 'customer',
							attributes: ['username', 'avatarUrl']
						}
					]
				})
				res.send(todoOrder)
				Logger.info('sold order get')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL,
					message: '获取失败'
				})
				Logger.info('sold order fail')
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
	route.get('/sold', isAuthenticated, async (req: Request, res: Response) => {
		const { orderNumber } = req.query
		const { myOpenId } = req.params

		try {
			const todoOrder = await Order.findAll({
				where: {
					dealerId: myOpenId,
					orderNumber
				},
				include: [
					{
						model: OrderDetail,
						attributes: ['productInfo', 'quantity', 'subtotal']
					},
					{ model: User, as: 'customer', attributes: ['username', 'avatarUrl'] }
				]
			})
			res.send(todoOrder)
			Logger.info('sold order get')
		} catch (err) {
			console.log(err)
			res.status(500).send({
				status: Status.FAIL,
				message: '获取失败'
			})
			Logger.info('sold order fail')
		}
	})
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
			const todoAddress = await Address.findByPk(addressId, {
				attributes: { exclude: ['id', 'status'] }
			})
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
						name: dataValues.name,
						storeProductId: dataValues.id
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
						address: { ...todoAddress?.dataValues },
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
			const { orders } = req.body
			const { myOpenId } = req.params
			const t = await db.transaction()
			try {
				for (const order of orders) {
					const todoOrder = await Order.update(
						{ status: 'Paid' },
						{ where: { id: order.id }, transaction: t, returning: true }
					)
					const todoOrderDetails = await OrderDetail.findAll({
						where: { orderId: order.id }
					})
					//find all products in store
					const todoStoreProducts = await StoreProduct.findAll({
						where: {
							productId: {
								[Op.or]: todoOrderDetails.map(orderDetail => {
									return orderDetail.dataValues.productId
								})
							},
							openId: myOpenId
						}
					})
					//find all related products from father
					const todoDealerProducts = await StoreProduct.findAll({
						where: {
							[Op.or]: todoStoreProducts.map(product => ({
								openId: product.dataValues.openIdFather,
								productId: product.dataValues.productId
							}))
						},
						include: {
							model: User,
							as: 'specialPrice',
							through: {
								where: {
									openIdChild: myOpenId
								}
							},
							attributes: ['username', 'avatarUrl']
						}
					})
					const orderNumber = makeOrderNumber()
					const orderData: any = []
					todoDealerProducts.forEach(({ dataValues }) => {
						const index = orderData.findIndex(
							(element: any) => element.dealerId! === dataValues.openId
						)
						const quantity = (todoOrderDetails as any).find(
							({ dataValues: orderValue }: any) =>
								orderValue.productId === dataValues.productId
						).quantity
						const actualPrice =
							dataValues.specialPrice.length > 0
								? dataValues.specialPrice[0]?.price.price
								: dataValues.defaultPrice
						const orderDetail = {
							productInfo: {
								price: actualPrice,
								coverImageUrl: dataValues.coverImageUrl,
								name: dataValues.name
							},
							productId: dataValues.productId,
							quantity,
							comment: order.comment,
							groupId: order.groupId,
							subtotal: quantity * actualPrice
						}
						if (dataValues.openId !== dataValues.openIdFather)
							if (index === -1) {
								orderData.push({
									orderNumber,
									groupId: order.groupId,
									payment: {
										totalAmount: quantity * actualPrice
									},
									userId: myOpenId,
									dealerId: dataValues.openId,
									address: { ...todoOrder[1][0].dataValues.address },
									comment: order.comment,
									status: 'Unpaid',
									orderDetails: [orderDetail]
								})
							} else {
								orderData[index].payment.totalAmount +=
									quantity * dataValues.actualPrice
								orderData[index].orderDetails?.push(orderDetail)
							}
					})
					console.log(orderData)
					orderData.length > 0 &&
						(await Order.bulkCreate(orderData, {
							transaction: t
						}))
				}

				await t.commit()
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Success sign to paid and transfer to father')
			} catch (error) {
				await t.rollback()
				console.log(error)
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
		'/preOrder',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			const preOrderResult = await wechatPay(req, myOpenId)
			res.send(preOrderResult)
			Logger.info('preOrder success')
		}
	)
}
