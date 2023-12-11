import { Router, Request, Response } from 'express'
import { Product, OrderProduct, SubOrder } from '../../../models/types/index'
import { Status, countryCodes, OrderStatus } from '../../../constants'
import { adminAuthenticated } from '../../../api/middleware/authorization'
import { query, Logger } from '../../../services'
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
}
