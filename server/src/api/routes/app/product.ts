import { Router, Request, Response } from 'express'
const route = Router()
import { query, Logger } from '../../../services'
import { queryName } from '../../../services/queryName'
import { isAuthenticated, myOpenId } from '../../middleware/authorization'
import { Product as ProductType } from '../../../models/types'
import { DBStatus, SaleStatus, Status } from '../../../constants'
import {
	Connection,
	Product,
	StoreProduct,
	Price,
	User,
	Order,
	Image
} from '../../../models/sequelize'
import { Op } from 'sequelize'

export const disableWholeProductLine = async (
	openIdFather: string,
	productId: string
) => {
	const queryResult = await query(queryName.disableAllChildrenInStoreProducts, [
		productId,
		openIdFather
	])
	if (queryResult.data.length !== 0) {
		for (const openIDItem of queryResult.data) {
			await disableWholeProductLine(openIDItem.openIDFather, productId)
		}
	}
}
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
							include: Product
					  })
					: []
			res.send({ alias: todoAlias, products: todoProducts })
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
		'/available-products',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoAlias = await Connection.findAll({
					where: {
						openIdChild: myOpenId,
						status: 'Active'
					}
				})

				const todoProduct = await StoreProduct.findAll({
					include: {
						model: Price,
						as: 'specialPrice',
						where: {
							openIdChild: myOpenId
						}
					},
					where: {
						openIdFather: {
							[Op.or]: todoAlias.map(connection => connection.dataValues.openId)
						}
					}
				})
				res.send(todoProduct)
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
		'/my-store',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId } = req.params
			try {
				const todoAlias = await Connection.findAll({
					where: {
						openIdChild: myOpenId
					}
				})
				const todoMyProducts = StoreProduct.findAll({
					where: {
						openId: myOpenId
					},
					include: {
						model: User,
						attributes: ['username', 'avatarUrl']
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
									}
								},
								where: {
									openIdFather: {
										[Op.or]: todoAlias.map(
											connection => connection.dataValues.openId
										)
									},
									status: 'Active'
								}
						  })
						: []
				const [myProducts, availableProducts] = await Promise.all([
					todoMyProducts,
					todoAvailableProducts
				])
				res.send({ myProducts, availableProducts })
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

	route.post(
		'/myPublishedProductsForChild',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const openIdChild = req.body.openID
			const queryResult = await query(
				queryName.mySaleProductListWithSepcificPrice,
				[myOpenId, openIdChild]
			)
			const products: ProductType[] = queryResult.data
			res.send({
				status: Status.SUCCESS,
				data: products
			})
			Logger.info('saleProduct with child price get')
		}
	)
	route.post(
		'/productsFromDealer',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const openIdFather = req.body.openID
			const queryResult = await query(queryName.mySaleProductListFromFather, [
				myOpenId,
				openIdFather
			])
			const products: ProductType[] = queryResult.data
			res.send({
				status: Status.SUCCESS,
				data: products
			})
			Logger.info(queryResult)
		}
	)
	route.get(
		'/product/:id',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { id } = req.params
			try {
				const todoProduct = await StoreProduct.findOne({
					where: {
						id
					},
					include: {
						model: Product,
						attributes: [
							'name',
							'description',
							'shortDescription',
							'setting',
							'coverImageUrl'
						]
					}
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
	route.post(
		'/special-price',
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
				const todoProduct = await Product.findOne({
					where: { id: product.productId, status: DBStatus.ACTIVE },
					attributes: [
						'name',
						'description',
						'coverImageUrl',
						'shortDescription'
					]
				})
				if (!todoProduct?.dataValues) {
					return res.send({
						status: 'FAIL',
						message: '此商品不存在'
					})
				}
				const [_storeProduct, created] = await StoreProduct.findOrCreate({
					where: {
						openId: myOpenId,
						productId: product.productId
					},
					defaults: {
						...todoProduct.dataValues,
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
	route.get(
		'/productsBySerialId',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const { serialForQRCode } = req.query
				const queryResult = await query(queryName.getProductBySerialId, [
					myOpenId,
					serialForQRCode as any
				])
				if (queryResult.count === 0) {
					res.send({
						status: Status.FAIL,
						message: 'product not exist'
					})
				} else {
					const product: ProductType = queryResult.data[0]
					const findAliasResult = await query(
						queryName.findEnableAliasByOpenID,
						[product.dealerSale.openId, myOpenId]
					)
					res.send({
						status: Status.SUCCESS,
						data: {
							product,
							alias: findAliasResult.data[0] ? true : false
						}
					})
				}
			} catch (error) {
				res.send({
					status: Status.FAIL,
					message: error
				})
			}
		}
	)
}
