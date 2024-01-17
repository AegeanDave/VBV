import { DataTypes } from 'sequelize'
import db from '../../config/database'

const ConnectionOrder = db.define('connections', {
	openId: {
		type: DataTypes.STRING,
		allowNull: false
	},
	orderNumber: { type: DataTypes.STRING, allowNull: false },
	amount: { type: DataTypes.JSONB, allowNull: false },
	status: {
		type: DataTypes.ENUM('Paid', 'Unpaid'),
		defaultValue: 'Unpaid'
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default ConnectionOrder
