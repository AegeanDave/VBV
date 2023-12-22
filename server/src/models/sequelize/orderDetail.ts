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
	groupId: { type: DataTypes.UUID, allowNull: false },
	productId: { type: DataTypes.UUID, allowNull: false },
	productInfo: {
		type: DataTypes.JSONB,
		allowNull: false
	},
	quantity: { type: DataTypes.INTEGER, allowNull: false },
	subtotal: { type: DataTypes.DECIMAL },
	shipment: { type: DataTypes.JSON },
	comment: {
		type: DataTypes.STRING
	},
	status: {
		type: DataTypes.ENUM('Processing', 'Cancelled', 'Completed', 'Shipped'),
		defaultValue: 'Processing'
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default OrderDetail
