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
	openIdChild: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: 'users',
			key: 'openId'
		}
	},
	status: {
		type: DataTypes.ENUM('Active', 'Inactive'),
		defaultValue: 'Active'
	},
	invitationId: { type: DataTypes.INTEGER, allowNull: false },
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Connection