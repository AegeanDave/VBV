import { Router } from 'express'
import user from './routes/app/user'
import product from './routes/app/product'
import productAdmin from './routes/admin/product'
import order from './routes/app/order'
import orderAdmin from './routes/admin/order'
import warehouse from './routes/app/warehouse'
import warehouseAdmin from './routes/admin/warehouse'

// guaranteed to get dependencies
export default () => {
	const app = Router()
	user(app)
	product(app)
	order(app)
	warehouse(app)
	warehouseAdmin(app)
	productAdmin(app)
	orderAdmin(app)

	return app
}
