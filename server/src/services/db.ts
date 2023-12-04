import { Pool } from 'pg'
import {
	userQuery,
	productQuery,
	orderQuery,
	warehouseQuery
} from './query/index'

const procedures: { [key: string]: string } = {
	login: userQuery.createNewUserWithoutInfo,
	updateUserInfo: userQuery.updateUserInfo,
	productList: productQuery.getProductList,
	fatherNumber: userQuery.getFatherNumber,
	childrenNumber: userQuery.getChildrenNumber,
	removeConnection: userQuery.updateAliasStatusToDisabled,
	updatePriceForChild: productQuery.updatePriceForChild,
	getAllAddress: userQuery.allAddress,
	addAddressWithoutFile: userQuery.newAddressWithoutFile,
	addAddressWithFile: userQuery.newAddressWithFile,
	deleteAddress: userQuery.deleteAddress,
	updateAddressWithImageOne: userQuery.updateAddressWithImageOne,
	updateAddressWithImageTwo: userQuery.updateAddressWithImageTwo,
	allChildren: userQuery.getAllChildren,
	allFathers: userQuery.getAllFathers,
	ordersFromFather: orderQuery.getOrdersFromFather,
	ordersFromChild: orderQuery.getOrdersFromChild,
	newOrderDetail: orderQuery.createNewOrderDetail,
	newOrder: orderQuery.createNewOrder,
	releaseNewProduct: productQuery.releaseNewProduct,
	releaseProduct: productQuery.releaseProduct,
	discontinueMySaleProduct: productQuery.updateMyProductToIdLEBySaleId,
	disableAllChildrenInStoreProducts:
		productQuery.disableAllChildrenInStoreProducts,
	myCodes: userQuery.myCodes,
	allCodes: userQuery.allCodes,
	newCode: userQuery.newCode,
	usedCode: userQuery.usedCode,
	checkAddressImage: userQuery.selectAddressImages,
	myPublishedProducts: productQuery.getMySaleProductListByPublish,
	updateDefaultPrice: productQuery.updateDefaultPrice,
	createOrUpdateAlias: userQuery.createOrUpdateAlias,
	mySaleProductListFromFather: productQuery.getMySaleProductListFromFather,
	mySaleProductListWithSepcificPrice:
		productQuery.getMySaleProductListWithSepcificPrice,
	markPaid: orderQuery.updateOrderStatusToPaid,
	markPaidWithComment: orderQuery.updateOrderStatusToPaidWithComment,
	findOpenIdByCode: userQuery.findOpenIdByCode,
	findAliasByOpenId: userQuery.findAliasByOpenId,
	createOrUpdatePrice: productQuery.createOrUpdatePrice,
	checkAliasExist: userQuery.findAliasByOpenId,
	getMyWarehouseProducts: warehouseQuery.getWarehouseProducts,
	getAllSaleOrders: orderQuery.getAllSaleOrdersUpdated,
	cancelOrder: orderQuery.updateOrderStatusToCanceled,
	cancelOrderDetail: orderQuery.updateOrderDetailStatusToCanceled,
	cancelOrderDetailByWarehouse:
		orderQuery.updateOrderDetailStatusToCanceledByWarehouse,
	hideOrder: orderQuery.updateOrderToHidden,
	getAddressById: userQuery.getAddressById,
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
	newAddressWithComment: userQuery.newAddressWithComment,
	myOrdersHistory: orderQuery.getAllPurchasedOrdersByFirstOrder,
	getProductBySerialId: productQuery.getProductBySerialId,
	findEnableAliasByOpenId: userQuery.findEnableAliasByOpenId,
	getSaleIdByOpenId: productQuery.getSaleIdByOpenId,
	getPrice: productQuery.getPrice,
	getPriceByFatherAndProduct: productQuery.getPriceByFatherAndProduct,
	checkInStoreProduct: productQuery.checkInStoreProduct,
	updateTrackingToShipping: orderQuery.updateTrackingToShipping,
	findOpenIdAndCode: userQuery.findOpenIdAndCode,
	getUserName: userQuery.getUserName
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
