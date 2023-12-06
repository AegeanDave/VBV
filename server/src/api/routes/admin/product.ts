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
		'/myWarehouseProducts',
		adminAuthenticated,
		async (req: Request, res: Response) => {
			const result = await query(queryName.getWarehouseProductsById, [
				myOpenId,
				myWarehouseId
			])
			res.status(200).send(result.data)
			Logger.info('warehouse products get')
		}
	)
}
