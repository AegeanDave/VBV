import Product from './product'
import Image from './image'
import Warehouse from './warehouse'
import User from './user'
import StoreProduct from './store'
import Order from './order'
import OrderDetail from './orderDetail'
import Address from './address'
import Invitation from './invitation'
import Connection from './connection'
import Price from './price'

User.hasOne(Warehouse, { foreignKey: 'openId' })
Warehouse.belongsTo(User, { foreignKey: 'openId' })

User.hasMany(StoreProduct, { foreignKey: 'openId' })
StoreProduct.belongsTo(User, { foreignKey: 'openId', as: 'me' })

User.hasMany(StoreProduct, { foreignKey: 'openIdFather' })
StoreProduct.belongsTo(User, { foreignKey: 'openIdFather', as: 'dealer' })

Warehouse.hasMany(Product, { foreignKey: 'warehouseId' })
Product.belongsTo(Warehouse, { foreignKey: 'warehouseId' })

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

User.hasMany(Invitation, { foreignKey: 'openId' })
Invitation.belongsTo(User, { foreignKey: 'openId' })

Invitation.hasOne(Connection, { foreignKey: 'invitationId' })
Connection.belongsTo(Invitation, { foreignKey: 'invitationId' })

User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Order, { foreignKey: 'dealerId' })
Order.belongsTo(User, { foreignKey: 'dealerId', as: 'dealer' })

User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' })

User.belongsToMany(User, {
	through: Connection,
	foreignKey: 'openId',
	as: 'customer'
})
User.belongsToMany(User, {
	through: Connection,
	foreignKey: 'openIdChild',
	as: 'dealer'
})

User.hasMany(Connection, { foreignKey: 'openId' })
Connection.belongsTo(User, { foreignKey: 'openId', as: 'dealer' })

User.hasMany(Connection, { foreignKey: 'openIdChild' })
Connection.belongsTo(User, { foreignKey: 'openIdChild', as: 'customer' })

StoreProduct.belongsToMany(User, {
	through: Price,
	as: 'specialPrice',
	foreignKey: 'storeProductId'
})
User.belongsToMany(StoreProduct, {
	through: Price,
	as: 'specialPrice',
	foreignKey: 'openIdChild'
})

StoreProduct.hasMany(Price, {
	foreignKey: 'storeProductId'
})
Price.belongsTo(StoreProduct, {
	as: 'dealerPrice',
	foreignKey: 'storeProductId'
})

export {
	Product,
	Image,
	Warehouse,
	StoreProduct,
	User,
	Address,
	Order,
	OrderDetail,
	Invitation,
	Connection,
	Price
}
