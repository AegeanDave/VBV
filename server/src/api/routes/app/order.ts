import { Router, Request, Response } from 'express'
import { Status, countryCodes, OrderStatus } from '../../../constants'
import { Logger } from '../../../services'
import { isAuthenticated } from '../../middleware/authorization'
import { v4 as uuidv4 } from 'uuid'
import {
	makeOrderNumber,
	sendOrderSubscribeMessage
} from '../../../provider/index'
import moment from 'moment-timezone'
import {
	Address,
	Order,
	OrderDetail,
	StoreProduct,
	User,
	ConnectionOrder
} from '../../../models/sequelize'
import { Op } from 'sequelize'
import db from '../../../config/database'
import { getPrepay, pay } from '../../../provider/wechat'
import { handleWarehouseOrderSMS } from '../../../utils/order'
import { handleCreateTransferingOrders } from '../../../utils/order'
import { OrderType } from '../../../models/types'

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
				res.send({
					...todoOrder?.dataValues,
					createdAt: moment(todoOrder?.dataValues.creadtedAt).format(
						'MM Do YYYY, h:mm'
					)
				})
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
							'MM Do YYYY, h:mm'
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
				},
				include: {
					model: User,
					as: 'specialPrice',
					through: {
						where: {
							openIdChild: myOpenId
						},
						attributes: ['price']
					},
					attributes: ['openId']
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
				const actualPrice =
					dataValues.specialPrice.length > 0
						? dataValues.specialPrice[0]?.price.price
						: dataValues.defaultPrice
				const orderDetail = {
					productInfo: {
						price: dataValues.defaultPrice,
						specialPrice: dataValues.specialPrice[0]?.price.price,
						coverImageUrl: dataValues.coverImageUrl,
						name: dataValues.name,
						storeProductId: dataValues.id
					},
					productId: dataValues.productId,
					quantity,
					comment,
					groupId,
					subtotal: quantity * actualPrice
				}
				if (index === -1) {
					orderData.push({
						orderNumber,
						groupId,
						payment: {
							totalAmount: quantity * actualPrice
						},
						userId: myOpenId,
						dealerId: dataValues.openId,
						address: { ...todoAddress?.dataValues },
						comment,
						status: 'Unpaid',
						orderDetails: [orderDetail]
					})
				} else {
					orderData[index].payment.totalAmount += quantity * actualPrice
					orderData[index].orderDetails?.push(orderDetail)
				}
			})
			const result = await Order.bulkCreate(orderData, {
				include: [OrderDetail],
				returning: true
			})
			for (const item of orderData) {
				sendOrderSubscribeMessage(orderNumber, myOpenId, item.dealerId, comment)
			}
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
			const { orders, newComment } = req.body
			const { myOpenId } = req.params
			const t = await db.transaction()
			const todoOrder = await Order.update(
				{ status: 'Paid' },
				{
					where: {
						id: orders.map((order: OrderType) => order.id),
						dealerId: myOpenId,
						status: 'Unpaid'
					},
					transaction: t,
					returning: true
				}
			)
			try {
				let orderData: any[] = []
				if (!todoOrder[1][0].dataValues[0]) {
					orderData = await handleCreateTransferingOrders(
						todoOrder[1][0].dataValues,
						newComment
					)
				} else {
					for (const order of todoOrder[1][0].dataValues) {
						const newOrder = await handleCreateTransferingOrders(
							order,
							newComment
						)
						orderData = [...orderData, ...newOrder]
					}
				}
				orderData.length > 0 &&
					(await Order.bulkCreate(orderData, {
						include: [OrderDetail],
						transaction: t
					}))
				for (const item of orderData) {
					sendOrderSubscribeMessage(
						item.orderNumber,
						myOpenId,
						item.dealerId,
						item.comment
					)
				}
				// for (const order of orders) {
				// 	// handleWarehouseOrderSMS(todoOrder[1][0].dataValues.dealerId)
				// 	const todoOrderDetails = await OrderDetail.findAll({
				// 		where: { orderId: order.id }
				// 	})
				// 	//find all products in store
				// 	const todoStoreProducts = await StoreProduct.findAll({
				// 		where: {
				// 			productId: {
				// 				[Op.or]: todoOrderDetails.map(orderDetail => {
				// 					return orderDetail.dataValues.productId
				// 				})
				// 			},
				// 			openId: myOpenId
				// 		}
				// 	})
				// 	//find all related products from father
				// 	const todoDealerProducts = await StoreProduct.findAll({
				// 		where: {
				// 			[Op.or]: todoStoreProducts.map(product => ({
				// 				openId: product.dataValues.openIdFather,
				// 				productId: product.dataValues.productId
				// 			}))
				// 		},
				// 		include: {
				// 			model: User,
				// 			as: 'specialPrice',
				// 			through: {
				// 				where: {
				// 					openIdChild: myOpenId
				// 				}
				// 			},
				// 			attributes: ['username', 'avatarUrl']
				// 		}
				// 	})
				// 	const orderNumber = makeOrderNumber()
				// 	const orderData: any = []
				// 	todoDealerProducts.forEach(({ dataValues }) => {
				// 		const index = orderData.findIndex(
				// 			(element: any) => element.dealerId! === dataValues.openId
				// 		)
				// 		const quantity = (todoOrderDetails as any).find(
				// 			({ dataValues: orderValue }: any) =>
				// 				orderValue.productId === dataValues.productId
				// 		).quantity
				// 		const actualPrice =
				// 			dataValues.specialPrice.length > 0
				// 				? dataValues.specialPrice[0]?.price.price
				// 				: dataValues.defaultPrice
				// 		const orderDetail = {
				// 			productInfo: {
				// 				price: actualPrice,
				// 				coverImageUrl: dataValues.coverImageUrl,
				// 				name: dataValues.name
				// 			},
				// 			productId: dataValues.productId,
				// 			quantity,
				// 			comment: newComment || order.comment,
				// 			groupId: order.groupId,
				// 			subtotal: quantity * actualPrice
				// 		}
				// 		if (dataValues.openId !== dataValues.openIdFather)
				// 			if (index === -1) {
				// 				orderData.push({
				// 					orderNumber,
				// 					groupId: order.groupId,
				// 					payment: {
				// 						totalAmount: quantity * actualPrice
				// 					},
				// 					userId: myOpenId,
				// 					dealerId: dataValues.openId,
				// 					address: { ...todoOrder[1][0].dataValues.address },
				// 					comment: newComment || order.comment,
				// 					status: 'Unpaid',
				// 					orderDetails: [orderDetail]
				// 				})
				// 			} else {
				// 				orderData[index].payment.totalAmount +=
				// 					quantity * dataValues.actualPrice
				// 				orderData[index].orderDetails?.push(orderDetail)
				// 			}
				// 	})
				// 	orderData.length > 0 &&
				// 		(await Order.bulkCreate(orderData, {
				// 			transaction: t
				// 		}))
				// 	for (const item of orderData) {
				// 		sendOrderSubscribeMessage(
				// 			orderNumber,
				// 			myOpenId,
				// 			item.dealerId,
				// 			item.comment
				// 		)
				// 	}
				// }

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
		'/mark-paid/all',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { userId } = req.body
			const { myOpenId } = req.params
			const t = await db.transaction()
			try {
				const todoOrder = await Order.update(
					{ status: 'Paid' },
					{
						where: { userId, dealerId: myOpenId, status: 'Unpaid' },
						transaction: t,
						returning: true
					}
				)
				let orderData: any[] = []
				if (!todoOrder[1][0].dataValues[0]) {
					orderData = await handleCreateTransferingOrders(
						todoOrder[1][0].dataValues
					)
				} else {
					for (const order of todoOrder[1][0].dataValues) {
						const newOrder = await handleCreateTransferingOrders(order)
						orderData = [...orderData, ...newOrder]
					}
				}
				orderData.length > 0 &&
					(await Order.bulkCreate(orderData, {
						include: [OrderDetail],
						transaction: t
					}))
				for (const item of orderData) {
					sendOrderSubscribeMessage(
						item.orderNumber,
						myOpenId,
						item.dealerId,
						item.comment
					)
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

	route.get(
		'/pay/instance',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const todoInstance = await getPrepay(req)
				res.send(todoInstance.data)
				Logger.info('preOrder success')
			} catch (err) {
				console.log(err)
				res.status(500)
			}
		}
	)
	route.post('/pay/webhook', async (req: Request, res: Response) => {
		const {
			resource: { ciphertext, associated_data, nonce }
		} = req.body
		try {
			const { payer, out_trade_no, amount, ...rest }: any = pay.decipher_gcm(
				ciphertext,
				associated_data,
				nonce,
				process.env.API_V3_KEY!
			)
			const todoOrder = await ConnectionOrder.create({
				openId: payer.openid,
				orderNumber: out_trade_no,
				amount,
				status: 'Paid'
			})
			res.end()
			Logger.info('Code order made success')
		} catch (err) {
			console.log(err)
			res.status(500).end()
		}
	})
}
