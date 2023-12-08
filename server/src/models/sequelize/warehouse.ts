import { DataTypes } from 'sequelize'
import db from '../../config/database'

const Warehouse = db.define('warehouses', {
	warehouseId: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	loginPhoneNumber: {
		type: DataTypes.STRING
	},
	password: {
		type: DataTypes.STRING
	},
	email: {
		type: DataTypes.STRING
	},
	setting: {
		type: DataTypes.JSON,
		allowNull: true
	},
	status: {
		type: DataTypes.ENUM('Active', 'Inactive', 'Not_Verified'),
		defaultValue: 'Not_Verified'
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})

export default Warehouse
