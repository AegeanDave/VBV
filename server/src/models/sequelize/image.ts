import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Image = db.define('images', {
	productId: {
		type: DataTypes.UUID
	},
	isCoverImage: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	url: {
		type: DataTypes.TEXT
	},
	priority: {
		type: DataTypes.INTEGER,
		defaultValue: 99
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Image
