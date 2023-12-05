import { Router } from 'express'
import user from './routes/user'
import product from './routes/product'
import orders from './routes/orders'
import warehouse from './routes/warehouse'
import warehouseAdmin from './routes/admin/warehouse'

// guaranteed to get dependencies
export default () => {
	const app = Router()
	user(app)
	product(app)
	orders(app)
	warehouse(app)
	warehouseAdmin(app)

	return app
}
