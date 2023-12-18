import { Pool } from 'pg'
import { productQuery, orderQuery, warehouseQuery } from './query/index'

const procedures: { [key: string]: string } = {
	productList: productQuery.getProductList,

	updatePriceForChild: productQuery.updatePriceForChild,

	ordersFromFather: orderQuery.getOrdersFromFather,
	ordersFromChild: orderQuery.getOrdersFromChild,
	newOrderDetail: orderQuery.createNewOrderDetail,
	newOrder: orderQuery.createNewOrder,
	releaseNewProduct: productQuery.releaseNewProduct,
	releaseProduct: productQuery.releaseProduct,
	discontinueMySaleProduct: productQuery.updateMyProductToIdLEBySaleId,
	disableAllChildrenInStoreProducts:
		productQuery.disableAllChildrenInStoreProducts,

	myPublishedProducts: productQuery.getMySaleProductListByPublish,
	updateDefaultPrice: productQuery.updateDefaultPrice,
	mySaleProductListFromFather: productQuery.getMySaleProductListFromFather,
	mySaleProductListWithSepcificPrice:
		productQuery.getMySaleProductListWithSepcificPrice,
	markPaid: orderQuery.updateOrderStatusToPaid,
	markPaidWithComment: orderQuery.updateOrderStatusToPaidWithComment,
	createOrUpdatePrice: productQuery.createOrUpdatePrice,
	getMyWarehouseProducts: warehouseQuery.getWarehouseProducts,
	getAllSaleOrders: orderQuery.getAllSaleOrdersUpdated,
	cancelOrder: orderQuery.updateOrderStatusToCanceled,
	cancelOrderDetail: orderQuery.updateOrderDetailStatusToCanceled,
	cancelOrderDetailByWarehouse:
		orderQuery.updateOrderDetailStatusToCanceledByWarehouse,
	hideOrder: orderQuery.updateOrderToHidden,
	getWarehouseProductsById: warehouseQuery.getWarehouseProductsByWarehouseId,
	adminLogin: warehouseQuery.adminLogin,
	getWarehouseOrders: orderQuery.getWarehouseOrders,
	createWarehouse: warehouseQuery.createWarehouse,
	onHoldProduct: productQuery.updateToOnHold,
	newProduct: productQuery.newProductByHead,
	editProduct: productQuery.editProductByHead,
	insertImage: productQuery.insertImage,
	updateTrackingInfo: orderQuery.updateTrackingInfo,
	checkWarehouse: warehouseQuery.checkWarehouse,
	getPriceId: productQuery.getPriceId,
	getSaleProductsByFather: productQuery.getSaleProductsByFather,
	updateProductToDELETEDByOpenIdFather:
		productQuery.updateProductToDELETEDByOpenIdFather,
	allChildrenInOrder: orderQuery.getOpenIdChildByOriginalOrder,
	updatePhone: warehouseQuery.updatePhone,
	updatePhoneAdmin: warehouseQuery.updatePhoneAdmin,
	updateSMSAndEmailService: warehouseQuery.updateSMSAndEmailService,
	getMailerUserInfo: warehouseQuery.getMailerUserInfo,
	getWarehouseId: warehouseQuery.getWarehouseId,
	myOrdersHistory: orderQuery.getAllPurchasedOrdersByFirstOrder,
	getProductBySerialId: productQuery.getProductBySerialId,
	getSaleIdByOpenId: productQuery.getSaleIdByOpenId,
	getPrice: productQuery.getPrice,
	getPriceByFatherAndProduct: productQuery.getPriceByFatherAndProduct,
	checkInStoreProduct: productQuery.checkInStoreProduct,
	updateTrackingToShipping: orderQuery.updateTrackingToShipping
}
export default async (key: string, value: (string | number | boolean)[]) => {
	const pool = new Pool({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: Number(process.env.DB_PORT)
	})
	const query = procedures[key]
	const result = await pool.query(query, value)
	return { count: result.rowCount, data: result.rows }
}
