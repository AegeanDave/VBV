import { DataTypes } from 'sequelize'
import db from '../../config/database'

const User = db.define('users', {
	openId: {
		type: DataTypes.STRING,
		primaryKey: true
	},
	username: {
		type: DataTypes.STRING
	},
	avatarUrl: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	holdingCodeNumber: {
		type: DataTypes.INTEGER,
		defaultValue: 5
	},
	idPhotoFrontUrl: {
		type: DataTypes.TEXT
	},
	idPhotoBackUrl: {
		type: DataTypes.TEXT
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default User
