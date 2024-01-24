import request from './request'
import { getProductList, getMyStore, getProduct, publishProduct, unpublishProduct, publishToStore, updatePriceForChild, updatePrice, deleteProduct } from './product'
import { getAuth, getSignup, getCodes, getWarehouse, makeNewConnection, getAccount, getAlias, createWarehouse, getCustomer, removeConnection, getDealer, uploadPhotoBack, uploadPhotoFront, addAddress, getAddresses, deleteAddress } from './user'
import { submitOrder, markPaid, cancelOrder, getAllPurchasedOrders, getAllSoldOrders, deleteOrder, getInstance, getOrderResult, getPurchasedOrder, getPurchasedOrderWithDealer, getSoldOrderWithCustomer, getSoldOrder, markPaidAll, hideOrder, completeOrder } from './order'

const updateUserInfo = (userInfo: {}) => request.postRequest("users/updateUserInfo", userInfo)
const getCountriesData = () => request.getRequest("users/countries")
const updatePhone = (phone: string, countryCode: string) => request.postRequest("warehouse/updatePhone", { phone: phone, countryCode: countryCode })
const charge = (params: object) => request.paymentRequest(params)
const getQRcode = (serialID: number) => request.getRequest("users/wxQRcode", { serialID: serialID })
const getProductInfoBySerialID = (serialID: number) => request.getRequest("products/productsBySerialID", { serialID: serialID })

export {
  getAuth,
  getProduct,
  updateUserInfo,
  getProductList,
  updatePrice, getAddresses,
  addAddress,
  deleteAddress,
  getAlias,
  getAccount,
  getCountriesData,
  uploadPhotoFront,
  uploadPhotoBack,
  submitOrder,
  getMyStore,
  createWarehouse,
  updatePhone,
  getWarehouse,
  publishToStore,
  publishProduct,
  unpublishProduct,
  getCustomer,
  removeConnection,
  markPaid,
  updatePriceForChild,
  getAllSoldOrders,
  cancelOrder,
  getInstance,
  charge,
  getAllPurchasedOrders,
  getQRcode,
  getProductInfoBySerialID,
  makeNewConnection,
  deleteOrder, getSignup, getCodes, getDealer, getOrderResult, getPurchasedOrder, getPurchasedOrderWithDealer, getSoldOrderWithCustomer, getSoldOrder, deleteProduct, markPaidAll, hideOrder, completeOrder
}
