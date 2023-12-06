import { Router, Request, Response } from 'express'
import { Product, OrderProduct, SubOrder } from '../../models/types/index'
import { Status, countryCodes, OrderStatus } from '../../constants'
import { query, Logger } from '../../services'
import { queryName } from '../../services/queryName'
import { isAuthenticated, myOpenId } from '../../api/middleware/authorization'
import wechatPay from '../../provider/weChatPay'
import { v4 as uuidv4 } from 'uuid'
import { sendNewOrderSMS } from '../../provider/twilio'
import { makeOrderNumber, sendSubscribeMessage } from '../../provider/index'
import { newOrderMail } from '../../provider/mailer'
import moment from 'moment-timezone'

const route = Router()

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

const groupProductsByDealer = (order: Product[]) => {
	const allFathers: any = []
	order.forEach((originProduct: Product) => {
		if (allFathers.indexOf(originProduct.dealerSale.openId) === -1) {
			allFathers.push(originProduct.dealerSale.openId)
		}
	})
	const groupedOrders: any = []
	allFathers.forEach((dealerOpenId: string) => {
		const newOrder = order.filter(
			(originalProduct: Product) =>
				originalProduct.dealerSale.openId === dealerOpenId
		)
		groupedOrders.push(newOrder)
	})
	return { allFathers, groupedOrders }
}
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

const handleCreateNonFirstOrder = async (
	subOrders: SubOrder[],
	addressId: string,
	originOrderId: string,
	orderNumber: string,
	comment?: string
) => {
	const queryList: any = []
	return new Promise((resolve, reject) => {
		subOrders.forEach((subOrder: SubOrder) => {
			if (subOrder.dealer.openId !== myOpenId) {
				const orderId = uuidv4()
				queryList.push(
					query(queryName.newOrder, [
						orderId,
						originOrderId,
						subOrder.dealer.openId,
						myOpenId,
						addressId,
						orderNumber,
						comment,
						false
					])
				)
				subOrder.orderProducts.forEach((product: OrderProduct) => {
					query(queryName.getPriceByFatherAndProduct, [
						product.openIdFather,
						product.productId,
						myOpenId
					])
						.then(res => {
							if (res.count === 0) {
								reject('product not in store')
							}
							queryList.push(
								query(queryName.newOrderDetail, [
									orderId,
									originOrderId,
									product.productId,
									product.quantity,
									res.data[0].price,
									res.data[0].openIdFather
								])
							)
						})
						.catch(err => {
							reject(err)
						})
				})
			} else {
				handleSendNewOrderMessage(myOpenId, originOrderId)
			}
		})
		Promise.all(queryList)
			.then((queryResult: any) => {
				subOrders.forEach((subOrder: SubOrder) => {
					if (myOpenId !== subOrder.dealer.openId)
						sendSubscribeMessage(
							orderNumber,
							myOpenId,
							moment().format('lll'),
							subOrder.dealer.openId
						)
				})
				resolve(true)
			})
			.catch(err => {
				reject(err)
			})
	})
}

const handleCreateFirstOrder = async (
	order: Product[],
	addressID: string,
	originalOrderID: string,
	orderNumber: string,
	comment?: string,
	isOrigin?: boolean
) => {
	const { groupedOrders, allFathers } = groupProductsByDealer(order)
	const queryList: any = []
	return new Promise((resolve, reject) => {
		groupedOrders.forEach((newOrder: any, index: number) => {
			if (allFathers[index] !== myOpenId) {
				const orderID = uuidv4()
				queryList.push(
					query(queryName.newOrder, [
						orderID,
						originalOrderID,
						allFathers[index],
						myOpenId,
						addressID,
						orderNumber,
						comment,
						isOrigin || false
					])
				)
				newOrder.forEach((product: Product) => {
					query(queryName.getPrice, [
						product.dealerSale.inStoreProductId,
						myOpenId
					])
						.then(res => {
							if (res.count === 0) {
								reject(false)
							}
							queryList.push(
								query(queryName.newOrderDetail, [
									orderID,
									originalOrderID,
									product.productId,
									product.quantity,
									res.data[0].price,
									product.dealerSale.openIdFather
								])
							)
						})
						.catch(err => {
							reject(false)
						})
				})
			} else {
				handleSendNewOrderMessage(myOpenId, originalOrderID)
			}
		})
		Promise.all(queryList)
			.then((queryResult: any) => {
				allFathers.forEach((openIDFather: string) => {
					sendSubscribeMessage(
						orderNumber,
						myOpenId,
						moment().format('lll'),
						openIDFather
					)
				})
				resolve(queryResult)
			})
			.catch(err => {
				reject(false)
			})
	})
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
		'/allSaleOrders',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryResult = await query(queryName.getAllSaleOrders, [myOpenId])
			if (queryResult.data) {
				queryResult.data.forEach(order => {
					const findShippingOrder = !order.subOrders.find((subOrder: any) =>
						subOrder.orderProducts.find(
							(product: any) =>
								product.status !== OrderStatus.SHIPPING &&
								product.status !== OrderStatus.CANCELLED
						)
					)
					if (findShippingOrder) {
						order.status = OrderStatus.COMPLETE
					}
				})
				res.send({
					status: Status.SUCCESS,
					data: queryResult.data
				})
				Logger.info('sale orders get')
			} else {
				res.send({
					status: Status.FAIL
				})
			}
		}
	)
	route.get(
		'/myPurchase',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const queryResult = await query(queryName.myOrdersHistory, [myOpenId])
				res.send({
					status: Status.SUCCESS,
					data: queryResult.data
				})
				Logger.info('purchased orders get')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('orders fail')
			}
		}
	)

	route.post(
		'/submitOrder',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const originOrderID = uuidv4()
			const orderNumber = makeOrderNumber()
			const { order, addressID, comment } = req.body
			const result = await handleCreateFirstOrder(
				order,
				addressID,
				originOrderID,
				orderNumber,
				comment,
				true
			)
			!result
				? res.send({
						status: Status.FAIL
				  })
				: res.send({
						status: Status.SUCCESS
				  })
		}
	)
	route.post(
		'/markPaid',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { orders } = req.body
			try {
				for (const order of orders) {
					query(queryName.markPaidWithComment, [
						order.orderId,
						order.newComment || order.comment
					])
					await handleCreateNonFirstOrder(
						order.subOrders,
						order.address.addressId,
						order.originOrderId,
						order.orderNumber,
						order.newComment
					)
				}
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Success sign to paid and transfer to father')
			} catch (error) {
				res.send({
					status: Status.FAIL,
					message: error
				})
				Logger.info('mark fail')
			}
		}
	)
	route.post(
		'/cancelOrder',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { order } = req.body
			try {
				await query(queryName.cancelOrder, [order.orderId])
				await query(queryName.cancelOrderDetail, [order.orderId])
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('order cancel success')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('cancel order fail')
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
