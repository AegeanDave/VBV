import { Router, Request, Response } from 'express'
const route = Router()
import { query, Logger } from '../../../services'
import { queryName } from '../../../services/queryName'
import {
	adminAuthenticated,
	myOpenId
} from '../../../api/middleware/authorization'
import { Product } from '../../../models/types'
import { SaleStatus, Status } from '../../../constants'
import StoreProduct from '../../../models/store'
import multiparty from 'multiparty'
import { upload } from '../../../provider/fileAction'

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
	app.use('/admin/products', route)
	route.get(
		'/products',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const todoProducts = await StoreProduct.findAll()
			res.status(200).send(todoProducts)
			Logger.info('warehouse products get')
		}
	)
	route.post(
		'/new-product',
		upload.single('coverImage'),
		upload.array('images', 10),
		async (req: Request, res: Response) => {
			console.log(req.files)
			try {
				const form = new multiparty.Form()
				// form.parse(req, async (error, fields, files) => {
				// 	if (error) throw error
				// 	const { product } = fields
				// })
			} catch (error) {
				res.send({
					status: Status.FAIL,
					message: error
				})
			}
		}
	)
}
