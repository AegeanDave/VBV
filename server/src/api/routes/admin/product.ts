import { Router, Request, Response } from 'express'
const route = Router()
import { Logger } from '../../../services'
import { adminAuthenticated } from '../../../api/middleware/authorization'
import { Product as ProductType } from '../../../models/types'
import { Status } from '../../../constants'
import StoreProduct from '../../../models/sequelize/store'
import { Product, Image } from '../../../models/sequelize'
import { upload } from '../../../provider/fileAction'
import { Op } from 'sequelize'
import db from '../../../config/database'

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
					attributes: ['id', 'defaultPrice', 'status']
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
			try {
				const todoProduct = await Product.create(
					{
						name,
						description,
						shortDescription,
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
					warehouseId: myWarehouseId,
					setting: { isFreeShipping, isIdRequired },
					coverImageUrl: coverImage[0].location,
					openIdFather: myOpenId,
					saleLevel: 0,
					defaultPrice: price,
					status: 'Active'
				})
				res.send(todoStore.dataValues)
			} catch (error) {
				console.log(error)
				return res.status(500).send({
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

			const t = await db.transaction()
			try {
				const todoProduct = await Product.update(toUpdatedProductFields, {
					where: { id, warehouseId: myWarehouseId },
					transaction: t
				})
				if (images && images.length > 0) {
					await Image.bulkCreate(
						images.map((image: any) => ({
							productId: id,
							url: image.location,
							isCoverImage: false
						})),
						{ transaction: t }
					)
				}
				if (removedImages && removedImages.length > 0) {
					await Image.destroy({
						where: {
							id: { [Op.or]: removedImages.map((image: any) => image.id) }
						},
						transaction: t
					})
				}
				await StoreProduct.update(
					{
						name,
						description,
						shortDescription,
						setting: { isFreeShipping, isIdRequired },
						defaultPrice: price,
						status: 'Active'
					},
					{
						where: {
							productId: id,
							openIdFather: myOpenId,
							openId: myOpenId,
							saleLevel: 0
						},
						transaction: t
					}
				)
				await t.commit()
				res.send({
					status: Status.SUCCESS,
					message: '更新成功'
				})
			} catch (error) {
				await t.rollback()
				console.log(error)
				return res.status(500).send({
					status: Status.FAIL,
					message: '更新失败'
				})
			}
		}
	)
	route.post(
		'/status',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const { id, action } = req.body
			const { myOpenId, myWarehouseId } = req.params
			const t = await db.transaction()

			try {
				let todoProduct
				if (action === 'Publish') {
					todoProduct = await StoreProduct.update(
						{ status: 'Active' },
						{
							where: { productId: id, openIdFather: myOpenId, openId: myOpenId }
						}
					)
				}
				if (action === 'Unpublish') {
					todoProduct = await StoreProduct.update(
						{ status: 'Inactive' },
						{
							where: { productId: id, openIdFather: myOpenId, openId: myOpenId }
						}
					)
				}
				if (action === 'Delete') {
					await Product.update(
						{ status: 'Inactive' },
						{ where: { id, warehouseId: myWarehouseId }, transaction: t }
					)
					await StoreProduct.update(
						{ status: 'Not_Available' },
						{
							where: { productId: id }
						}
					)
					await t.commit()
				}
				if (todoProduct && todoProduct[0] === 0) {
					return res.status(204).end()
				}
				return res.send({
					status: Status.SUCCESS,
					message: '更新成功'
				})
			} catch (error) {
				console.log(error)
				await t.rollback()
				return res.status(500).send({
					status: Status.FAIL,
					message: '更新失败'
				})
			}
		}
	)
}
