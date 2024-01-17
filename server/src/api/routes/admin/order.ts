import { Router, Request, Response } from 'express'
import { Status, countryCodes, OrderStatus } from '../../../constants'
import { adminAuthenticated } from '../../../api/middleware/authorization'
import { Logger } from '../../../services'
import { sendNewOrderSMS } from '../../../provider/twilio'
import { sendOrderSubscribeMessage } from '../../../provider/index'
import moment from 'moment-timezone'
import { Order, OrderDetail, User } from '../../../models/sequelize/'
import { Op } from 'sequelize'
import { createPresignedUrlWithClient } from '../../../provider/fileAction'
import archiver from 'archiver'
import db from '../../../config/database'

const route = Router()

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

export default (app: Router) => {
	app.use('/admin/order', route)

	route.get('/all', adminAuthenticated, async (req: Request, res: Response) => {
		const { myOpenId, myWarehouseId } = req.params
		try {
			const todoOrders = await Order.findAll({
				where: { dealerId: myOpenId, status: { [Op.ne]: 'Unpaid' } },
				include: [{ model: OrderDetail }, User]
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
	route.get(
		'/id-photo',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { id }: any = req.query
			try {
				const photoUrls = await User.findByPk(id, {
					attributes: ['idPhotoFrontUrl', 'idPhotoBackUrl']
				})
				res.status(200).send(photoUrls)
				Logger.info('id photos get success')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL
				})
				Logger.info('logout fail')
			}
		}
	)
	route.post(
		'/action',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const {
				order: { id, groupId },
				trackingInfo,
				action
			} = req.body
			const t = await db.transaction()
			try {
				const todoOrderDetail = await OrderDetail.findAll({
					where: { orderId: id }
				})
				if (action === 'REJECT') {
					todoOrderDetail.length > 0 &&
						(await OrderDetail.update(
							{ status: 'Cancelled' },
							{
								where: {
									groupId,
									productId: {
										[Op.or]: todoOrderDetail.map(
											({ dataValues }) => dataValues.productId
										)
									}
								},
								transaction: t
							}
						))
					await Order.update(
						{ status: 'Cancelled' },
						{
							where: {
								id
							},
							transaction: t
						}
					)
				} else if (action === 'SHIP' || action === 'EDIT') {
					todoOrderDetail.length > 0 &&
						(await OrderDetail.update(
							{
								status: 'Shipped',
								shipment: trackingInfo
							},
							{
								where: {
									groupId,
									productId: {
										[Op.or]: todoOrderDetail.map(
											({ dataValues }) => dataValues.productId
										)
									}
								}
							}
						))
					await Order.update(
						{ status: 'Shipped' },
						{
							where: {
								id
							},
							transaction: t
						}
					)
					// handleUnitMessage(
					// 	orderNumber,
					// 	trackingNumber,
					// 	carrier,
					// 	order.originOrderId
					// )
				}
				await t.commit()
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('order update success')
			} catch (err) {
				console.log(err)
				await t.rollback()
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('order update fail')
			}
		}
	)
	route.get(
		'/id-photo/presigned-url',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { url }: any = req.query
			try {
				const file = createPresignedUrlWithClient(url)
				res.send(file)
				Logger.info('Presigned Url get')
			} catch (err) {
				res.status(500).send()
				Logger.info('Presigned Url fail')
			}
		}
	)
	//deprecated
	route.get(
		'/id-photos/download',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { urls }: any = req.query
			console.log(urls)
			const zipFileName = 'id-photos.zip'
			try {
				const file1 = createPresignedUrlWithClient(urls[0])
				const file2 = createPresignedUrlWithClient(urls[1])
				const files = await Promise.all([file1, file2])
				console.log(files)

				res.setHeader(
					'Content-Disposition',
					`attachment; filename=${zipFileName}`
				)
				res.setHeader('Content-Type', 'application/zip')
				const archive = archiver('zip', {
					zlib: { level: 8 } // Set compression level (optional)
				})

				archive.pipe(res)
				archive.append(files[0], { name: 'photo-front' })
				archive.append(files[1], { name: 'photo-back' })

				archive.finalize()
				Logger.info('file downloaded')
			} catch (err) {
				res.status(500).send()
				Logger.info('file download fail')
			}
		}
	)
}
