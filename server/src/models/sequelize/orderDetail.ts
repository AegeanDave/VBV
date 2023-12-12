import { DataTypes } from 'sequelize'
import db from '../../config/database'

const OrderDetail = db.define('orderDetails', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	orderId: {
		type: DataTypes.UUID
	},
	productInfo: {
		type: DataTypes.JSONB,
		allowNull: false
	},
	quantity: { type: DataTypes.INTEGER, allowNull: false },
	subtotal: { type: DataTypes.INTEGER },
	comment: {
		type: DataTypes.STRING
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default OrderDetail
