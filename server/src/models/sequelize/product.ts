import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Product = db.define('products', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	ownerId: {
		type: DataTypes.STRING,
		allowNull: false
	},
	warehouseId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	coverImageUrl: { type: DataTypes.STRING, allowNull: true },
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	currency: {
		type: DataTypes.ENUM('USD', 'CNY', 'CAD'),
		defaultValue: 'CNY'
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
		type: DataTypes.ENUM('Active', 'Inactive', 'Onhold'),
		defaultValue: 'Active'
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Product
