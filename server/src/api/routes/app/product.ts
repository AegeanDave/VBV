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
	User
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
						openIdChild: myOpenId,
						status: 'Active'
					}
				})
				const todoMyProducts = StoreProduct.findAll({
					where: {
						openId: myOpenId
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
	route.post(
		'/updatePriceForChild',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { openIdChild, price, inStoreProductId, priceId } = req.body
			let queryResult
			if (priceId) {
				queryResult = await query(queryName.updatePriceForChild, [
					price,
					priceId
				])
			} else {
				queryResult = await query(queryName.createOrUpdatePrice, [
					openIdChild,
					inStoreProductId,
					price
				])
			}
			if (queryResult.count !== 0) {
				res.send({
					status: Status.SUCCESS
				})
				Logger.info('updatePrice success for child')
			} else {
				res.send({
					status: Status.FAIL
				})
				Logger.info('updatePrice fail')
			}
		}
	)

	route.post(
		'/updateSale',
		isAuthenticated,
		async (req: Request, res: Response) => {
			try {
				const { product } = req.body
				const price = parseFloat(product.mySale.newPrice)
				let queryResult
				if (product.mySale && product.mySale.inStoreProductId) {
					queryResult = await query(queryName.releaseProduct, [
						price,
						product.mySale.inStoreProductId
					])
				} else {
					queryResult = await query(queryName.releaseNewProduct, [
						product.productId,
						myOpenId,
						product.dealerSale.openId,
						price
					])
				}
				res.send({
					status: Status.SUCCESS,
					data: queryResult.data[0]
				})
				Logger.info('updatePrice success')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('updatePrice fail')
			}
		}
	)
	route.post(
		'/unreleaseProduct',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { product } = req.body
			const queryResult = await query(queryName.discontinueMySaleProduct, [
				product.mySale.inStoreProductId
			])
			if (queryResult.count === 1) {
				disableWholeProductLine(myOpenId, product.productId)
				res.send({
					status: 'SUCCESS'
				})
				Logger.info('unrelease success')
			} else {
				res.send({
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
