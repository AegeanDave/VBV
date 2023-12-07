import { DataTypes } from 'sequelize'
import db from '../config/database'

const Product = db.define('products', {
	ownerId: {
		type: DataTypes.STRING,
		references: 'users'
	},
	warehouseId: {
		type: DataTypes.UUID,
		references: 'warehouses'
	},
	name: {
		type: DataTypes.STRING
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true
	},
	shortDescription: {
		type: DataTypes.STRING,
		allowNull: true
	},
	price: {
		type: DataTypes.FLOAT,
		allowNull: true
	},
	setting: {
		type: DataTypes.JSON
	},
	status: {
		type: DataTypes.ENUM('Active', 'Inactive', 'onHold'),
		defaultValue: 'Active'
	}
})

Product.sync().then(() => {
	return console.log('Product Table Created')
})
export default Product
