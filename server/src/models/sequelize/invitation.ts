import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Invitation = db.define('invitations', {
	openId: {
		type: DataTypes.STRING,
		allowNull: false
	},
	code: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	status: {
		type: DataTypes.ENUM('Active', 'Inactive')
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Invitation
