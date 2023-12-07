import { DataTypes } from 'sequelize'
import db from '../config/database'

const StoreProduct = db.define('inStoreProducts', {
	productId: {
		type: DataTypes.UUID,
		references: 'products'
	},
	name: {
		type: DataTypes.STRING
	},
	price: {
		type: DataTypes.FLOAT,
		allowNull: true
	},
	saleLevel: { type: DataTypes.INTEGER, defaultValue: 99 },
	status: {
		type: DataTypes.ENUM('Active', 'Inactive'),
		defaultValue: 'Active'
	}
})

StoreProduct.sync().then(() => {
	return console.log('StoreProduct Table Created')
})
export default StoreProduct
