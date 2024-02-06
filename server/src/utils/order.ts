import { sendNewOrderSMS } from '../provider/twilio'
import { OrderDetail, StoreProduct, User, Warehouse } from '../models/sequelize'
import { makeOrderNumber } from '../provider'
import { Op } from 'sequelize'

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

const handleCreateTransferingOrders = async (
	oldOrder: any,
	newComment?: string
) => {
	// handleWarehouseOrderSMS(todoOrder[1][0].dataValues.dealerId)
	const todoOrderDetails = await OrderDetail.findAll({
		where: { orderId: oldOrder.id }
	})
	//find all products in store
	const todoStoreProducts = await StoreProduct.findAll({
		where: {
			productId: {
				[Op.or]: todoOrderDetails.map(orderDetail => {
					return orderDetail.dataValues.productId
				})
			},
			openId: oldOrder.dealerId,
			openIdFather: { [Op.ne]: oldOrder.dealerId },
			status: { [Op.ne]: 'Not_Available' }
		}
	})
	//find all related products from father
	const todoDealerProducts = await StoreProduct.findAll({
		where: {
			[Op.or]: todoStoreProducts.map(product => ({
				openId: product.dataValues.openIdFather,
				productId: product.dataValues.productId
			}))
		},
		include: {
			model: User,
			as: 'specialPrice',
			through: {
				where: {
					openIdChild: oldOrder.dealerId
				}
			},
			attributes: ['username', 'avatarUrl']
		}
	})
	const orderNumber = makeOrderNumber()
	const orderData: any = []
	todoDealerProducts.forEach(({ dataValues }) => {
		const index = orderData.findIndex(
			(element: any) => element.dealerId! === dataValues.openId
		)
		const quantity = (todoOrderDetails as any).find(
			({ dataValues: orderValue }: any) =>
				orderValue.productId === dataValues.productId
		).quantity
		const actualPrice =
			dataValues.specialPrice.length > 0
				? dataValues.specialPrice[0]?.price.price
				: dataValues.defaultPrice
		const orderDetail = {
			productInfo: {
				price: actualPrice,
				coverImageUrl: dataValues.coverImageUrl,
				name: dataValues.name
			},
			productId: dataValues.productId,
			quantity,
			comment: newComment || oldOrder.comment,
			groupId: oldOrder.groupId,
			subtotal: quantity * actualPrice
		}
		if (index === -1) {
			orderData.push({
				orderNumber,
				groupId: oldOrder.groupId,
				payment: {
					totalAmount: quantity * actualPrice
				},
				userId: oldOrder.dealerId,
				dealerId: dataValues.openId,
				address: { ...oldOrder.address },
				comment: newComment || oldOrder.comment,
				status: 'Unpaid',
				orderDetails: [orderDetail]
			})
		} else {
			orderData[index].payment.totalAmount += quantity * dataValues.actualPrice
			orderData[index].orderDetails?.push(orderDetail)
		}
	})
	return orderData
}
export { handleWarehouseOrderSMS, handleCreateTransferingOrders }
