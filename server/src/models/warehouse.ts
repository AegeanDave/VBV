import { DataTypes } from 'sequelize'
import db from '../config/database'

const Warehouse = db.define('warehouses', {
	openId: {
		type: DataTypes.STRING,
		references: 'users'
	},
	warehouseId: {
		type: DataTypes.UUID
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
	}
})

Warehouse.sync().then(() => {
	return console.log('Warehouse Table Created')
})
export default Warehouse
