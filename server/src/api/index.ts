import { Router } from 'express'
import user from './routes/app/user'
import product from './routes/app/product'
import productAdmin from './routes/admin/product'
import orders from './routes/app/orders'
import orderAdmin from './routes/admin/order'
import warehouse from './routes/app/warehouse'
import warehouseAdmin from './routes/admin/warehouse'

// guaranteed to get dependencies
export default () => {
	const app = Router()
	user(app)
	product(app)
	orders(app)
	warehouse(app)
	warehouseAdmin(app)
	productAdmin(app)
	orderAdmin(app)

	return app
}
