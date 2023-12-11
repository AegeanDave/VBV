import Product from './product'
import Image from './image'
import Warehouse from './warehouse'
import User from './user'
import StoreProduct from './store'

User.hasOne(Warehouse, { foreignKey: 'openId' })
Warehouse.belongsTo(User, { foreignKey: 'openId' })

Product.hasMany(Image, {
	foreignKey: 'productId'
})
Image.belongsTo(Product)
Product.hasMany(StoreProduct, { foreignKey: 'productId', as: 'storeRecord' })
StoreProduct.belongsTo(Product, { foreignKey: 'productId' })

export { Product, Image, Warehouse, StoreProduct, User }
