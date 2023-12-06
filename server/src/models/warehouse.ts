import Sequelize from 'sequelize'
import db from '../config/database'

const Warehouse = db.define('warehouses', {
	openId: {
		type: Sequelize.STRING,
		references: 'users'
	},
	warehouseId: {
		type: Sequelize.UUID
	},
	loginPhoneNumber: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	setting: {
		type: Sequelize.JSON,
		allowNull: true
	},
	status: {
		type: Sequelize.ENUM('Active', 'Inactive', 'Not_Verified'),
		defaultValue: 'Not_Verified'
	}
})

Warehouse.sync().then(() => {
	return console.log('Warehouse Table Created')
})
export default Warehouse
