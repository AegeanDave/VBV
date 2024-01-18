import { Warehouse } from '../models/sequelize'
import { sendNewOrderSMS } from '../provider/twilio'

const handleWarehouseOrderSMS = async (dealerId: string) => {
	const todoCheckWarehouse = await Warehouse.findOne({
		where: { openId: dealerId }
	})
	if (todoCheckWarehouse) {
		sendNewOrderSMS(
			todoCheckWarehouse.dataValues.secondaryPhoneNumber ||
				todoCheckWarehouse.dataValues.loginPhoneNumber
		)
	}
}

export { handleWarehouseOrderSMS }
