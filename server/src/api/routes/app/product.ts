import { Router, Request, Response } from 'express'
const route = Router()
import { Logger } from '../../../services'
import { isAuthenticated } from '../../middleware/authorization'
import { Product as ProductType } from '../../../models/types'
import { DBStatus, Status } from '../../../constants'
import {
	Connection,
	Product,
	StoreProduct,
	Price,
	User,
	Image
} from '../../../models/sequelize'
import { Op } from 'sequelize'
import db from '../../../config/database'
import moment from 'moment-timezone'
import { handleGetImages } from '../../../utils/product'
import { posterRender } from '../../../provider/poster'

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

export default (app: Router) => {
	app.use('/products', route)

	route.get('/all', isAuthenticated, async (req: Request, res: Response) => {
		const { myOpenId } = req.params
		try {
			const todoAlias = await Connection.findAll({
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
			const todoProducts =
				todoAlias.length > 0
					? await StoreProduct.findAll({
							where: {
								openId: {
									[Op.or]: todoAlias.map(
										connection => connection.dataValues.openId
									)
								},
								status: 'Active'
							},
							include: [
								{ model: Product, attributes: ['setting'] },
								{
									model: User,
									as: 'specialPrice',
									through: {
										where: {
											openIdChild: myOpenId
										},
										attributes: ['price']
									},
									attributes: ['username', 'avatarUrl']
								}
							]
					  })
					: []
			res.send({
				alias: todoAlias,
				products: todoProducts.map(({ dataValues }: any) => ({
					...dataValues,
					from: todoAlias.find(
						(user: any) => user.dataValues.openId === dataValues.openId
					)
				}))
			})
			Logger.info('products get')
		} catch (error) {
			res.status(500).send({
				status: Status.FAIL,
				message: error
			})
			Logger.info(error)
		}
	})
	route.get(
		'/store/dealer',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoAlias = await Connection.findAll({
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
				const todoProduct = await StoreProduct.findAll({
					include: {
						model: User,
						as: 'specialPrice',
						through: {
							where: {
								openIdChild: myOpenId
							}
						},
						attributes: ['username', 'avatarUrl', 'openId']
					},
					where: {
						openId: {
							[Op.or]: todoAlias.map(connection => connection.dataValues.openId)
						},
						openIdFather: { [Op.ne]: myOpenId },
						status: DBStatus.ACTIVE
					}
				})
				const groupedProducts: any = {}
				todoProduct.forEach(({ dataValues }) => {
					const dealerId = dataValues.openId

					if (!groupedProducts[dealerId]) {
						groupedProducts[dealerId] = []
					}

					groupedProducts[dealerId].push({
						...dataValues,
						createdAt: moment(dataValues.createdAt).format('YYYY-MM-DD h:mm')
					})
				})
				res.send({
					dealers: todoAlias,
					dealerProducts: groupedProducts
				})
				Logger.info('all saleProducts get')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info(err)
			}
		}
	)

	route.get(
		'/store/me',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoAlias = await Connection.findAll({
					where: {
						openIdChild: myOpenId
					},
					include: {
						model: User,
						as: 'dealer',
						attributes: ['username', 'avatarUrl']
					}
				})
				const todoMyProducts = StoreProduct.findAll({
					where: {
						openId: myOpenId
					},
					include: {
						model: User,
						as: 'dealer',
						attributes: ['username', 'avatarUrl', 'openId']
					}
				})
				const todoAvailableProducts =
					todoAlias.length > 0
						? StoreProduct.findAll({
								include: {
									model: User,
									as: 'specialPrice',
									through: {
										where: {
											openIdChild: myOpenId
										}
									},
									attributes: ['username', 'avatarUrl', 'openId']
								},
								where: {
									openId: {
										[Op.or]: todoAlias.map(
											connection => connection.dataValues.openId
										)
									},
									status: DBStatus.ACTIVE
								},
								limit: 5
						  })
						: []
				const [myProducts, availableProducts] = await Promise.all([
					todoMyProducts,
					todoAvailableProducts
				])
				res.send({
					myProducts: myProducts.map(({ dataValues }: any) => ({
						...dataValues,
						createdAt: moment(dataValues.createdAt).format('YYYY-MM-DD h:mm')
					})),
					availableProducts: availableProducts.map(({ dataValues }: any) => ({
						...dataValues,
						createdAt: moment(dataValues.createdAt).format('YYYY-MM-DD h:mm'),
						from: todoAlias.find(
							(user: any) => user.dataValues.openId === dataValues.openId
						)
					}))
				})
				Logger.info('all saleProducts get')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info(err)
			}
		}
	)

	route.get(
		'/product/:id',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id, myOpenId } = req.params
			try {
				const todoProduct = await StoreProduct.findOne({
					where: {
						id
					},
					include: [
						{
							model: Product,
							attributes: [
								'name',
								'description',
								'shortDescription',
								'setting',
								'coverImageUrl'
							]
						},
						{
							model: User,
							as: 'specialPrice',
							through: {
								where: {
									openIdChild: myOpenId
								},
								attributes: ['price']
							},
							attributes: ['username', 'avatarUrl']
						}
					]
				})
				const todoImage = await Image.findAll({
					where: { productId: todoProduct?.dataValues.productId }
				})
				res.send({
					...todoProduct?.dataValues,
					images: todoImage.map(image => ({ ...image.dataValues }))
				})
				Logger.info('product get')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info(err)
			}
		}
	)
	route.post('/price', isAuthenticated, async (req: Request, res: Response) => {
		const { price, product } = req.body
		try {
			await StoreProduct.update(
				{ defaultPrice: price },
				{
					where: {
						id: product.id
					}
				}
			)
			res.send({
				status: Status.SUCCESS
			})
			Logger.info('updatePrice success')
		} catch (err) {
			console.log(err)
			res.send({
				status: Status.FAIL
			})
			Logger.info('updatePrice fail')
		}
	})
	route.post(
		'/price/special',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { openIdChild, price, product } = req.body
			try {
				const [_price, created] = await Price.findOrCreate({
					where: {
						openIdChild,
						storeProductId: product.id
					},
					defaults: {
						price: price,
						productId: product.productId
					}
				})
				if (!created) {
					await Price.update(
						{
							price: price
						},
						{
							where: {
								openIdChild,
								storeProductId: product.id
							}
						}
					)
				}
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('updatePrice success for child')
			} catch (err) {
				console.log(err)
				res.send({
					status: Status.FAIL
				})
				Logger.info('updatePrice fail')
			}
		}
	)
	route.post(
		'/publish',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { product } = req.body
			const { myOpenId } = req.params
			try {
				await StoreProduct.update(
					{
						status: DBStatus.ACTIVE
					},
					{ where: { id: product.id, openId: myOpenId } }
				)
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('release success')
			} catch (err) {
				res.status(500).send({
					status: 'FAIL'
				})
				Logger.info('release fail')
			}
		}
	)
	route.post(
		'/publish/new',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { product, newPrice } = req.body
			const { myOpenId } = req.params
			try {
				const todoCheck = await StoreProduct.findOne({
					where: {
						productId: product.productId,
						openId: myOpenId
					}
				})
				if (todoCheck?.dataValues) {
					return res.send(true)
				}
				const todoProduct = await StoreProduct.findOne({
					where: { id: product.id, status: DBStatus.ACTIVE },
					attributes: [
						'productId',
						'openId',
						'name',
						'description',
						'coverImageUrl',
						'shortDescription',
						'saleLevel'
					]
				})
				if (!todoProduct?.dataValues) {
					return res.send({
						status: 'FAIL',
						message: '此商品不存在'
					})
				}
				const { openId, productId, ...reset } = todoProduct.dataValues
				const [_storeProduct, created] = await StoreProduct.findOrCreate({
					where: {
						openId: myOpenId,
						openIdFather: openId,
						productId: productId
					},
					defaults: {
						...reset,
						saleLevel: todoProduct.dataValues.saleLevel + 1,
						defaultPrice: newPrice,
						status: DBStatus.ACTIVE
					}
				})
				if (created) {
					Logger.info('release success')
					return res.send({
						status: 'SUCCESS'
					})
				}
				return res.send({
					status: 'FAIL',
					message: '此商品已在您的商店中'
				})
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: 'FAIL'
				})
				Logger.info('release fail')
			}
		}
	)
	route.post(
		'/unpublish',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { product } = req.body
			const { myOpenId } = req.params
			try {
				await StoreProduct.update(
					{
						status: DBStatus.INACTIVE
					},
					{ where: { id: product.id, openId: myOpenId } }
				)
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('unrelease success')
			} catch (err) {
				res.status(500).send({
					status: 'FAIL'
				})
				Logger.info('unrelease fail')
			}
		}
	)
	route.delete(
		'/store/product',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { product } = req.body
			const { myOpenId } = req.params
			const t = await db.transaction()

			try {
				await StoreProduct.destroy({
					where: { id: product.id, openId: myOpenId },
					transaction: t
				})
				await StoreProduct.update(
					{
						status: 'Not_Available'
					},
					{
						where: {
							openIdFather: myOpenId,
							productId: product.productId
						},
						transaction: t
					}
				)
				await t.commit()
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('release success')
			} catch (err) {
				t.rollback()
				res.status(500).send({
					status: 'FAIL'
				})
				Logger.info('release fail')
			}
		}
	)
	route.post(
		'/store/product/poster',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { product, text, numOfImage } = req.body
			try {
				const images = await handleGetImages(product.productId, numOfImage)
				const imageBuffer = await posterRender({
					name: product.name,
					images,
					text
				})
				res.setHeader('Content-Type', 'image/png')
				res.send(imageBuffer)

				Logger.info('Images created')
			} catch (err) {
				console.log(err)
				res.status(500).send({
					status: 'FAIL'
				})
				Logger.info('Images created failed')
			}
		}
	)
}
