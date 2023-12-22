import request from './request'
import { getProductList, getMyStore, getProduct, publishProduct, unpublishProduct, publishToStore, updatePriceForChild } from './product'
import { getAuth, getSignup, getCodes, getWarehouse, makeNewConnection, getAccount, getAlias, createWarehouse, getCustomer, removeConnection, getDealer, uploadPhotoBack, uploadPhotoFront, addAddress, getAddresses, deleteAddress } from './user'
import { submitOrder, markPaid, cancelOrder, getAllPurchasedOrders, getAllSoldOrders, hideOrder, preOrder, getOrderResult, getPurchasedOrder,getPurchasedOrderWithDealer } from './order'

const updateUserInfo = (userInfo: {}) => request.postRequest("users/updateUserInfo", userInfo)
const getFatherAndChildNumber = () => request.getRequest("users/fatherAndChildNumber")
const newCode = () => request.postRequest("users/newCode")
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
  getFatherAndChildNumber,
  getAddresses,
  addAddress,
  deleteAddress,
  getAlias,
  newCode,
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
  preOrder,
  charge,
  getAllPurchasedOrders,
  getQRcode,
  getProductInfoBySerialID,
  makeNewConnection,
  hideOrder, getSignup, getCodes, getDealer, getOrderResult, getPurchasedOrder, getPurchasedOrderWithDealer
}
