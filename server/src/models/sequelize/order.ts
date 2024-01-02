import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Order = db.define('orders', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	groupId: { type: DataTypes.UUID, allowNull: false },
	orderNumber: {
		type: DataTypes.STRING
	},
	address: {
		type: DataTypes.JSONB
	},
	comment: {
		type: DataTypes.TEXT
	},
	userId: { type: DataTypes.STRING, allowNull: false },
	dealerId: { type: DataTypes.STRING, allowNull: false },
	payment: {
		type: DataTypes.JSON
	},
	status: {
		type: DataTypes.ENUM(
			'Paid',
			'Onhold',
			'Processing',
			'Unpaid',
			'Cancelled',
			'Completed',
			'Shipped'
		),
		defaultValue: 'Unpaid'
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Order
