import Sequelize from 'sequelize'
import db from '../config/database'

const Product = db.define('products', {
	ownerId: {
		type: Sequelize.STRING
	},
	name: {
		type: Sequelize.STRING
	},
	description: {
		type: Sequelize.STRING,
		allowNull: true
	},
	shortDescription: {
		type: Sequelize.STRING,
		allowNull: true
	},
	price: {
		type: Sequelize.FLOAT,
		allowNull: true
	},
	setting: {
		type: Sequelize.JSON
	},
	status: {
		type: Sequelize.ENUM('Active', 'Inactive', 'onHold'),
		defaultValue: 'Active'
	}
})

Product.sync().then(() => {
	return console.log('Product Table Created')
})
export default Product
