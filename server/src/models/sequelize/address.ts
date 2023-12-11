import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Address = db.define('addresses', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	openId: { type: DataTypes.STRING, allowNull: false },
	street: { type: DataTypes.STRING },
	city: { type: DataTypes.STRING, allowNull: false },
	state: { type: DataTypes.STRING, allowNull: false },
	country: { type: DataTypes.STRING, allowNull: false },
	recipient: { type: DataTypes.STRING, allowNull: false },
	phone: { type: DataTypes.STRING, allowNull: false },
	idPhotoFrontUrl: {
		type: DataTypes.TEXT
	},
	idPhotoBackUrl: {
		type: DataTypes.TEXT
	},
	quickInput: {
		type: DataTypes.STRING
	},
	status: {
		type: DataTypes.ENUM('Active', 'Inactive', 'Default')
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Address
