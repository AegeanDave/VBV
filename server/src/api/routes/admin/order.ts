import { Router, Request, Response } from 'express'
import { Product, OrderProduct, SubOrder } from '../../../models/types/index'
import { Status, countryCodes, OrderStatus } from '../../../constants'
import { adminAuthenticated } from '../../../api/middleware/authorization'
import { Logger } from '../../../services'
import { sendNewOrderSMS } from '../../../provider/twilio'
import { makeOrderNumber, sendSubscribeMessage } from '../../../provider/index'
import { newOrderMail } from '../../../provider/mailer'
import moment from 'moment-timezone'
import { Order, OrderDetail, Address } from '../../../models/sequelize/'

const route = Router()

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

export default (app: Router) => {
	app.use('/admin/order', route)

	route.get('/all', adminAuthenticated, async (req: Request, res: Response) => {
		const { myOpenId, myWarehouseId } = req.params
		try {
			const todoOrders = await Order.findAll({
				where: { dealerId: myOpenId },
				include: [{ model: OrderDetail }, Address]
			})
			Logger.info('Orders get')
			return res.send(todoOrders)
		} catch (err) {
			console.log(err)
			return res.status(500).send({
				status: Status.FAIL
			})
		}
	})
	route.post(
		'/update',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const {
				order: {
					id,
					orderNumber,
					shipment: { carrier, trackingNumber, status }
				},
				action
			} = req.body
			try {
				if (action === 'REJECT') {
					Order.update(
						{ status: 'Cancelled' },
						{
							where: {
								id
							}
						}
					)
					Logger.info('order update success')
				} else if (action === 'SHIP' || action === 'EDIT') {
					Order.update(
						{
							status: 'Shipped',
							shipment: {
								carrier,
								trackingNumber,
								status: status || 'Shipping'
							}
						},
						{
							where: {
								id
							}
						}
					)
					// handleUnitMessage(
					// 	orderNumber,
					// 	trackingNumber,
					// 	carrier,
					// 	order.originOrderId
					// )
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
}
