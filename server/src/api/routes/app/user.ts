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
				const todoAddress = await Address.findAll({
					where: {
						openId: myOpenId
					}
				})
				res.send(todoAddress)
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
	// route.post(
	// 	'/newAddress',
	// 	isAuthenticated,
	// 	async (req: Request, res: Response) => {
	// 		const { address, selectedField } = req.body
	// 		try {
	// 			let queryResult
	// 			if (selectedField === addressField.NORMALFORM) {
	// 				queryResult = await query(queryName.addAddressWithoutFile, [
	// 					myOpenId,
	// 					address.street,
	// 					address.city,
	// 					address.province,
	// 					'中国',
	// 					address.name,
	// 					address.phone
	// 				])
	// 			} else if (selectedField === addressField.QUICKFORM) {
	// 				queryResult = await query(queryName.addAddressWithComment, [
	// 					myOpenId,
	// 					address.quickInputAddress
	// 				])
	// 			}
	// 			res.send(queryResult.data)
	// 			Logger.info('address added')
	// 		} catch (err) {
	// 			res.send({
	// 				status: Status.FAIL,
	// 				message: err
	// 			})
	// 			Logger.info('address add fail')
	// 		}
	// 	}
	// )

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
			await Address.destroy({
				where: { id, openId: myOpenId }
			})
			res.send()
			Logger.info('update success')
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
			const { length } = req.body
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
	route.delete(
		'/connection',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id } = req.body
			const { myOpenId } = req.params

			const t = await db.transaction()
			try {
				const todoConnection = await Connection.update(
					{ status: DBStatus.INACTIVE },
					{
						where: {
							id,
							[Op.or]: [{ openId: myOpenId }, { openIdChild: myOpenId }]
						},
						transaction: t,
						returning: true
					}
				)
				const { openId, openIdChild } = todoConnection[1][0].dataValues
				await StoreProduct.update(
					{ status: 'Not_Available' },
					{
						where: {
							openId: openIdChild,
							openIdFather: openId
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
		'/delete-connection',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id } = req.body
			const { myOpenId } = req.params

			const t = await db.transaction()
			try {
				const todoConnection = await Connection.update(
					{ status: 'Inactive' },
					{
						where: {
							id,
							[Op.or]: [{ openId: myOpenId }, { openIdChild: myOpenId }]
						},
						transaction: t,
						returning: true
					}
				)
				const { openId, openIdChild } = todoConnection[1][0].dataValues
				await StoreProduct.update(
					{ status: 'Not_Available' },
					{
						where: {
							openId: openIdChild,
							openIdFather: openId
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
}
