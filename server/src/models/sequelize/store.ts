import { DataTypes } from 'sequelize'
import db from '../../config/database'

const StoreProduct = db.define('inStoreProducts', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	productId: {
		type: DataTypes.UUID
	},
	name: {
		type: DataTypes.STRING,
		allowNull: true
	},
	description: { type: DataTypes.STRING, allowNull: true },
	shortDescription: { type: DataTypes.STRING, allowNull: true },
	coverImageUrl: { type: DataTypes.STRING, allowNull: true },
	defaultPrice: {
		type: DataTypes.FLOAT,
		defaultValue: 0
	},
	openId: {
		type: DataTypes.STRING,
		allowNull: false
	},
	openIdFather: {
		type: DataTypes.STRING,
		allowNull: false
	},
	saleLevel: { type: DataTypes.INTEGER, defaultValue: 99 },
	status: {
		type: DataTypes.ENUM('Active', 'Inactive', 'Not_Available'),
		defaultValue: 'Active'
	},
	setting: { type: DataTypes.JSONB },
	warehouseId: { type: DataTypes.UUID },
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default StoreProduct
