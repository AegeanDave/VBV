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
	city: { type: DataTypes.STRING },
	state: { type: DataTypes.STRING },
	country: { type: DataTypes.STRING, allowNull: false },
	recipient: { type: DataTypes.STRING },
	phone: { type: DataTypes.STRING },
	postcode: { type: DataTypes.STRING },
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
		type: DataTypes.ENUM('Active', 'Inactive', 'Default'),
		defaultValue: 'Active'
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Address
