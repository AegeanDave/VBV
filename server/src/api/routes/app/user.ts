import { Router, Request, Response } from 'express'
import { myCache } from '../../../provider/cache'
const route = Router()
import { query, Logger } from '../../../services'
import { login, makeCode, getQRcode } from '../../../provider'
import { isAuthenticated, myOpenId } from '../../middleware/authorization'
import { queryName } from '../../../services/queryName'
import { upload } from '../../../provider/fileAction'
import { Status, Image, DBStatus, addressField } from '../../../constants'
import {
	Address,
	Connection,
	Invitation,
	StoreProduct,
	OrderDetail,
	Order,
	User
} from '../../../models/sequelize'
import db from '../../../config/database'
import { Op } from 'sequelize'

export default (app: Router) => {
	app.use('/users', route)

	route.post('/login', async (req: Request, res: Response) => {
		const { code } = req.body
		try {
			const {
				data: { session_key, openid }
			} = await login(code)
			myCache.set(session_key, openid, 10000)
			const [{ dataValues }] = await User.upsert({ openId: openid })
			const { username, status, avatarUrl } = dataValues
			res.send({ session_key, openid, username, avatarUrl, status })
			Logger.info('Login Success')
		} catch (err) {
			res.send({ success: false, message: 'Login fail' })
			return
		}
	})
	route.post(
		'/signup',
		isAuthenticated,
		upload.single('avatar'),
		async (req: Request, res: Response) => {
			const avatar = req.file as any
			const { username } = req.body
			const { myOpenId } = req.params
			try {
				const todoSignup = await User.update(
					{ username, avatarUrl: avatar.location, status: DBStatus.ACTIVE },
					{ where: { openId: myOpenId }, returning: true }
				)
				const newUser = todoSignup[1][0].dataValues
				res.send({
					username: newUser.username,
					avatarUrl: newUser.avatarUrl,
					status: newUser.status
				})
				Invitation.bulkCreate(
					Array.from({ length: 5 }, () => ({
						code: makeCode(),
						openId: myOpenId,
						status: 'Active'
					}))
				)
				Logger.info('Signup Success')
			} catch (err) {
				console.log(err)
				res.send({ success: false, message: 'Login fail' })
				return
			}
		}
	)
	route.get(
		'/account',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoUser = await User.findByPk(myOpenId, {
					include: [
						{
							model: User,
							as: 'customer',
							through: {
								where: {
									openId: myOpenId,
									status: DBStatus.ACTIVE
								}
							}
						},
						{
							model: User,
							as: 'dealer',
							through: {
								where: {
									openIdChild: myOpenId,
									status: DBStatus.ACTIVE
								}
							}
						}
					]
				})
				res.send(todoUser)
				Logger.info('Account fetch successfully')
			} catch (err) {
				console.log(err)
				res.status(500).send()
				Logger.info('Account fetch error')
			}
		}
	)
	route.post(
		'/updateUserInfo',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { nickName, avatarUrl } = req.body
			const result = await query(queryName.updateUserInfo, [
				nickName,
				avatarUrl,
				myOpenId
			])
			res.send(result)
			Logger.info('Upload Success')
		}
	)

	route.get(
		'/customers',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoCustomers = await Connection.findAll({
					where: {
						openId: myOpenId,
						status: DBStatus.ACTIVE
					},
					include: {
						model: User,
						as: 'customer',
						attributes: ['username', 'avatarUrl']
					}
				})
				res.send(todoCustomers)
				Logger.info('all children get')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL
				})
				Logger.info('Children fetch failed')
			}
		}
	)
	route.get(
		'/dealers',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoDealers = await Connection.findAll({
					where: {
						openIdChild: myOpenId,
						status: DBStatus.ACTIVE
					},
					include: {
						model: User,
						as: 'dealer',
						attributes: ['username', 'avatarUrl']
					}
				})
				res.send(todoDealers)
				Logger.info('all fathers get')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: Status.FAIL
				})
				Logger.info('Fathers get failed')
			}
		}
	)

	route.get(
		'/addresses',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoAddress = Address.findAll({
					where: {
						openId: myOpenId,
						status: DBStatus.ACTIVE
					}
				})
				const todoId = User.findOne({
					where: {
						openId: myOpenId,
						idPhotoFrontUrl: { [Op.is]: null },
						idPhotoBackUrl: { [Op.is]: null }
					}
				})
				const result = await Promise.all([todoAddress, todoId])
				res.send({ addresses: result[0], hasId: !result[1]?.dataValues })
				Logger.info('address loaded ')
			} catch (err) {
				res.status(500).send()
				Logger.info('address loading fail')
			}
		}
	)
	route.get(
		'/address/:id',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id, myOpenId } = req.params
			const todoAddress = await Address.findOne({
				where: { id, openId: myOpenId }
			})
			res.send(todoAddress)
			Logger.info('address loaded success')
		}
	)
	route.post(
		'/upload/front',
		isAuthenticated,
		upload.single('front'),
		async (req: Request, res: Response) => {
			const file = req.file as any
			const { myOpenId } = req.params
			try {
				await User.update(
					{ idPhotoFrontUrl: file?.location },
					{ where: { openId: myOpenId } }
				)
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('Photo front upload success')
			} catch (err) {
				console.log(err)
				res.send()
				Logger.info('Photo front upload failed')
			}
		}
	)
	route.post(
		'/upload/back',
		isAuthenticated,
		upload.single('back'),
		async (req: Request, res: Response) => {
			const file = req.file as any
			const { myOpenId } = req.params
			try {
				await User.update(
					{ idPhotoBackUrl: file?.location },
					{ where: { openId: myOpenId } }
				)
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('Photo back upload success')
			} catch (err) {
				console.log(err)
				res.status(500).send()
				Logger.info('Photo back upload failed')
			}
		}
	)
	route.post(
		'/address/new',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const {
				address: { street, city, province, name, phone, quickInputAddress },
				selectedField
			} = req.body
			const { myOpenId } = req.params
			try {
				let todoAddress
				if (selectedField === addressField.NORMALFORM) {
					todoAddress = await Address.create(
						{
							street,
							city,
							state: province,
							country: '中国',
							recipient: name,
							phone,
							openId: myOpenId
						},
						{ returning: true }
					)
				} else if (selectedField === addressField.QUICKFORM) {
					todoAddress = await Address.create(
						{
							openId: myOpenId,
							country: '中国',
							quickInput: quickInputAddress
						},
						{ returning: true }
					)
				}
				res.send(todoAddress?.dataValues)
				Logger.info('address added')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('address add fail')
			}
		}
	)

	route.post(
		'/update-address',
		isAuthenticated,
		upload.fields([
			{ name: 'idFront', maxCount: 1 },
			{ name: 'idBack', maxCount: 1 }
		]),
		async (req: Request, res: Response) => {
			const { id } = req.body
			const { idFront, idBack } = req.files as any
			try {
				const todoAddress = await Address.update(
					{
						idPhotoFrontUrl: idFront[0].location,
						idPhotoBackUrl: idBack[0].location
					},
					{ where: { id } }
				)
				res.send()
				Logger.info('Address update successfully')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL
				})
				Logger.info('Address update failed')
			}
		}
	)
	route.delete(
		'/address',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id } = req.body
			const { myOpenId } = req.params
			try {
				await Address.destroy({
					where: { id, openId: myOpenId }
				})
				res.send({ status: Status.SUCCESS })
				Logger.info('address deleted')
			} catch (err) {
				console.log(err)
				res.send({ status: Status.FAIL })
			}
		}
	)
	route.get(
		'/my-codes',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoCodes = await Invitation.findAll({
					where: {
						openId: myOpenId,
						status: DBStatus.ACTIVE
					}
				})
				res.send(todoCodes)
				Logger.info('Codes loaded successfully')
			} catch (err) {
				console.log(err)
				res.send({ status: Status.FAIL })
				Logger.info('Codes loaded failed')
			}
		}
	)
	route.post(
		'/new-code',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			// should be updated for security
			const { length = 1 } = req.body
			try {
				const todoInvitation = await Invitation.bulkCreate(
					Array.from({ length }, () => ({
						openId: myOpenId,
						code: makeCode(),
						status: 'Active'
					}))
				)
				res.send(todoInvitation)
				Logger.info('Codes created')
			} catch (err) {
				res.status(500).send({
					status: Status.FAIL
				})
				Logger.info('Codes created failed')
			}
		}
	)

	route.get(
		'/wxQRcode',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const result = await getQRcode(req.query)
			res.send({
				status: Status.SUCCESS,
				data: result.data
			})
		}
	)

	route.post(
		'/remove-connection',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id } = req.body
			const { myOpenId } = req.params

			const t = await db.transaction()
			try {
				await Connection.update(
					{ status: DBStatus.INACTIVE },
					{
						where: {
							openIdChild: myOpenId,
							openId: id
						},
						transaction: t
					}
				)
				await StoreProduct.update(
					{ status: 'Not_Available' },
					{
						where: {
							openId: myOpenId,
							openIdFather: id
						},
						transaction: t
					}
				)
				await t.commit()
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Remove connection successfully')
			} catch (err) {
				await t.rollback()
				res.status(500).send({
					status: Status.FAIL,
					message: '解除关系失败'
				})
				Logger.info('Remove connection fail')
			}
		}
	)

	route.delete(
		'/connection',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id } = req.body
			const { myOpenId } = req.params

			const t = await db.transaction()
			try {
				await Connection.destroy({
					where: {
						openIdChild: id,
						openId: myOpenId
					},
					transaction: t
				})
				await StoreProduct.update(
					{ status: 'Not_Available' },
					{
						where: {
							openId: id,
							openIdFather: myOpenId
						},
						transaction: t
					}
				)
				await t.commit()
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Remove connection successfully')
			} catch (err) {
				await t.rollback()
				res.status(500).send({
					status: Status.FAIL,
					message: '解除关系失败'
				})
				Logger.info('Remove connection fail')
			}
		}
	)

	route.post(
		'/new-connection',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { code } = req.body
			const { myOpenId } = req.params
			try {
				const todoDealer = await Invitation.findOne({ where: { code } })
				if (!todoDealer?.dataValues?.code) {
					return res.send({
						status: Status.FAIL,
						message: '邀请码有误'
					})
				}
				if (todoDealer?.dataValues?.openId === myOpenId) {
					return res.send({
						status: Status.FAIL,
						message: '您不能关注自己'
					})
				}
				const todoConnection = await Connection.findOne({
					where: { openId: todoDealer.dataValues.openId, openIdChild: myOpenId }
				})
				if (todoConnection?.dataValues.status === 'Active') {
					return res.send({
						status: Status.FAIL,
						message: '您已关注此经销商'
					})
				}
				await Connection.findOrCreate({
					where: {
						openId: todoDealer.dataValues.openId,
						openIdChild: myOpenId
					},
					defaults: {
						status: 'Active',
						invitationId: todoDealer.dataValues.id
					}
				})
				await Invitation.update({ status: 'Inactive' }, { where: { code } })
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('Build connection successfully')
			} catch (err) {
				Logger.info('Build connection failed')
				return res.status(500).send({
					status: Status.FAIL,
					message: '关注失败'
				})
			}
		}
	)
	route.get(
		'/customer/:id',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id, myOpenId } = req.params
			try {
				const todoUser = await User.findByPk(id, {
					attributes: ['openId', 'username', 'avatarUrl']
				})
				const todoChildProducts = await StoreProduct.findAll({
					include: {
						model: User,
						as: 'specialPrice',
						attributes: ['username'],
						through: {
							where: {
								openIdChild: id
							},
							attributes: ['price']
						}
					},
					where: {
						openId: myOpenId
					}
				})
				const todoChildOrders = await Order.findAll({
					where: {
						userId: id,
						dealerId: myOpenId
					}
				})
				res.send({
					user: todoUser,
					products: todoChildProducts,
					orders: todoChildOrders
				})
				Logger.info(`Child's product and order get`)
			} catch (err) {
				res.status(500).send()
				Logger.info(`Child's product and order fetch failed`)
			}
		}
	)
	route.get(
		'/dealer/:id',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id, myOpenId } = req.params
			try {
				const todoUser = await User.findByPk(id, {
					attributes: ['openId', 'username', 'avatarUrl']
				})
				const todoChildProducts = await StoreProduct.findAll({
					include: {
						model: User,
						as: 'specialPrice',
						attributes: ['username'],
						through: {
							where: {
								openIdChild: myOpenId
							},
							attributes: ['price']
						}
					},
					where: {
						openId: id,
						status: DBStatus.ACTIVE
					}
				})
				const todoChildOrders = await Order.findAll({
					where: {
						userId: myOpenId,
						dealerId: id
					},
					include: [
						{
							model: OrderDetail,
							attributes: ['productInfo', 'quantity', 'subtotal']
						}
					]
				})
				const unpaidAmount = todoChildOrders.reduce((sum, order) => {
					if (order.dataValues.status === 'Unpaid') {
						return sum + (order.dataValues.payment?.totalAmount || 0)
					}
					return sum + 0
				}, 0)
				res.send({
					user: todoUser,
					products: todoChildProducts,
					orders: todoChildOrders,
					unpaidAmount
				})
				Logger.info(`Father's product and order get`)
			} catch (err) {
				res.status(500).send()
				Logger.info(`Father's product and order fetch failed`)
			}
		}
	)
}
