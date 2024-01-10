import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Connection = db.define('connections', {
	openId: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: 'users',
			key: 'openId'
		}
	},
	quantity: { type: DataTypes.INTEGER, allowNull: false },
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

export default Connection
