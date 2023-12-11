import { Router, Request, Response } from 'express'
const route = Router()
import { query, Logger } from '../../../services'
import { queryName } from '../../../services/queryName'
import { adminAuthenticated } from '../../../api/middleware/authorization'
import { Product as ProductType } from '../../../models/types'
import { SaleStatus, Status } from '../../../constants'
import StoreProduct from '../../../models/sequelize/store'
import { Product, Image } from '../../../models/sequelize'
import { upload } from '../../../provider/fileAction'
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
	app.use('/admin/product', route)
	route.get(
		'/all-products',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { myOpenId, myWarehouseId } = req.params

			const todoProducts = await Product.findAll({
				where: { warehouseId: myWarehouseId },
				include: {
					model: StoreProduct,
					as: 'storeRecord',
					where: { openId: myOpenId, openIdFather: myOpenId },
					attributes: ['defaultPrice', 'status']
				}
			})
			res.status(200).send(todoProducts)
			Logger.info('warehouse products get')
		}
	)
	route.get('/:id', adminAuthenticated, async (req: Request, res: Response) => {
		const { myOpenId, id } = req.params
		console.log(id)
		const todoProducts = await Product.findByPk(id, {
			include: [
				{
					model: StoreProduct,
					as: 'storeRecord',
					where: { openId: myOpenId, openIdFather: myOpenId },
					attributes: ['defaultPrice', 'status']
				},
				{ model: Image }
			]
		})
		res.status(200).send(todoProducts)
		Logger.info('warehouse product get')
	})
	route.post(
		'/new-product',
		adminAuthenticated,
		upload.fields([
			{ name: 'coverImage', maxCount: 1 },
			{ name: 'images', maxCount: 10 }
		]),
		async (req: Request, res: Response) => {
			console.log(req.files)
			try {
				const { coverImage, images } = req.files as any
				const {
					name,
					description,
					price,
					isFreeShipping,
					isIdRequired,
					shortDescription = ''
				} = JSON.parse(req.body?.product)
				const { myOpenId, myWarehouseId } = req.params
				const todoProduct = await Product.create(
					{
						name,
						description,
						price,
						coverImageUrl: coverImage[0].location,
						setting: { isFreeShipping, isIdRequired },
						ownerId: myOpenId,
						warehouseId: myWarehouseId,
						images: (images || []).map((file: any) => ({
							url: file.location,
							isCoverImage: false
						}))
					},
					{ include: [Image] }
				)
				const todoStore = await StoreProduct.create({
					productId: todoProduct.dataValues.id,
					name,
					description,
					shortDescription,
					openId: myOpenId,
					coverImageUrl: coverImage[0].location,
					openIdFather: myOpenId,
					saleLevel: 0,
					defaultPrice: price,
					status: 'Active'
				})
				res.send(todoStore.dataValues)
			} catch (error) {
				console.log(error)
				res.send({
					status: Status.FAIL,
					message: error
				})
			}
		}
	)
	route.post(
		'/edit',
		adminAuthenticated,
		upload.fields([
			{ name: 'coverImage', maxCount: 1 },
			{ name: 'images', maxCount: 10 }
		]),
		async (req: Request, res: Response) => {
			console.log(req.files)
			try {
				const { coverImage, images } = req.files as any

				const {
					id,
					name,
					description,
					price,
					isFreeShipping,
					isIdRequired,
					shortDescription = '',
					removedImages
				} = JSON.parse(req.body?.product)
				const toUpdatedProductFields: any = {
					id,
					name,
					description,
					price,
					setting: { isFreeShipping, isIdRequired },
					shortDescription
				}
				if (coverImage) {
					toUpdatedProductFields.coverImageUrl = coverImage[0].location
				}
				const { myOpenId, myWarehouseId } = req.params
				const todoProduct = await Product.update(toUpdatedProductFields, {
					where: { id, warehouseId: myWarehouseId },
					returning: true
				})
				console.log(todoProduct)
				// if (!todoProduct?.dataValues) {
				// 	images: (images || []).map((file: any) => ({
				// 		url: file.location,
				// 		isCoverImage: false
				// 	}))
				// 	res.send({
				// 		status: Status.FAIL,
				// 		message: '上传失败'
				// 	})
				// 	return
				// }
				// if (images && images.length > 0) {
				// 	const todoImages = await Image.bulkCreate(
				// 		images.map((image: any) => ({
				// 			url: image.location,
				// 			isCoverImage: false
				// 		}))
				// 	)
				// }
				// if (removedImages && removedImages.length > 0) {
				// 	const todoImages = await Image.destroy({
				// 		where: {
				// 			id: { [Op.or]: removedImages.map((image: any) => image.id) }
				// 		}
				// 	})
				// }
				// const todoStore = await StoreProduct.create({
				// 	productId: todoProduct.dataValues.id,
				// 	name,
				// 	description,
				// 	shortDescription,
				// 	openId: myOpenId,
				// 	coverImageUrl: coverImage[0].location,
				// 	openIdFather: myOpenId,
				// 	saleLevel: 0,
				// 	defaultPrice: price,
				// 	status: 'Active'
				// })
				// res.send(todoStore.dataValues)
			} catch (error) {
				console.log(error)
				res.send({
					status: Status.FAIL,
					message: error
				})
			}
		}
	)
}
