import Product from './product'
import Image from './image'
import Warehouse from './warehouse'
import User from './user'
import StoreProduct from './store'
import Order from './order'
import OrderDetail from './orderDetail'
import Address from './address'

User.hasOne(Warehouse, { foreignKey: 'openId' })
Warehouse.belongsTo(User, { foreignKey: 'openId' })

Product.hasMany(Image, {
	foreignKey: 'productId'
})
Image.belongsTo(Product)

Product.hasMany(StoreProduct, { foreignKey: 'productId', as: 'storeRecord' })
StoreProduct.belongsTo(Product, { foreignKey: 'productId' })

Order.hasMany(OrderDetail, { foreignKey: 'orderId' })
OrderDetail.belongsTo(Order, { foreignKey: 'orderId' })

User.hasMany(Address, { foreignKey: 'openId' })
Address.belongsTo(User, { foreignKey: 'openId' })

Order.belongsTo(Address)

export {
	Product,
	Image,
	Warehouse,
	StoreProduct,
	User,
	Address,
	Order,
	OrderDetail
}
