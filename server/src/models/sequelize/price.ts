import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Price = db.define('price', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	openIdChild: {
		type: DataTypes.STRING,
		allowNull: false
	},
	productId: {
		type: DataTypes.UUID
	},
	storeProductId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	price: {
		type: DataTypes.DECIMAL
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Price
