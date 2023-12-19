import request from './request'
import { getProductList, getMyStore, getProduct, publishProduct, unpublishProduct, publishToStore, updatePriceForChild } from './product'
import { getAuth, getSignup, getCodes, getWarehouse, makeNewConnection, getAccount, getAlias, createWarehouse, getCustomer, removeConnection, getDealer } from './user'
import { Address, Product, SaleOrder } from "../../models/index"

const updateUserInfo = (userInfo: {}) => request.postRequest("users/updateUserInfo", userInfo)
const getFatherAndChildNumber = () => request.getRequest("users/fatherAndChildNumber")
const getAddress = () => request.getRequest("users/getAddress")
const addAddress = (address: Address, selectedField: number) => request.postRequest("users/newAddress", { address, selectedField })
const deleteAddress = (id: string) => request.deleteRequest("users/deleteAddress", { id: id })
const newCode = () => request.postRequest("users/newCode")
const uploadImage = (filePath: string, id: string) => request.uploadImage("users/uploadFile", filePath, id)
const getCountriesData = () => request.getRequest("users/countries")
const submitOrder = (order: Product[], addressID: string, comment: string) => request.postRequest("orders/submitOrder", { order, addressID, comment })
const updatePhone = (phone: string, countryCode: string) => request.postRequest("warehouse/updatePhone", { phone: phone, countryCode: countryCode })
const markPaid = (orders: SaleOrder[]) => request.postRequest("orders/markPaid", { orders: orders })
const getAllSaleOrders = () => request.getRequest("orders/allSaleOrders")
const getAllPurchaseOrders = () => request.getRequest("orders/myPurchase")
const cancelOrder = (order: SaleOrder) => request.postRequest("orders/cancelOrder", { order: order })
const hideOrder = (order: SaleOrder) => request.postRequest("orders/hideOrder", { order: order })
const getAddressByID = (id: string) => request.getRequest("users/getAddressByID", { id: id })
const preOrder = () => request.postRequest("orders/preOrder")
const charge = (params: object) => request.paymentRequest(params)
const getQRcode = (serialID: number) => request.getRequest("users/wxQRcode", { serialID: serialID })
const getProductInfoBySerialID = (serialID: number) => request.getRequest("products/productsBySerialID", { serialID: serialID })



export {
  getAuth,
  getProduct,
  updateUserInfo,
  getProductList,
  getFatherAndChildNumber,
  getAddress,
  getAddressByID,
  addAddress,
  deleteAddress,
  getAlias,
  newCode,
  getAccount,
  getCountriesData,
  uploadImage,
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
  getAllSaleOrders,
  cancelOrder,
  preOrder,
  charge,
  getAllPurchaseOrders,
  getQRcode,
  getProductInfoBySerialID,
  makeNewConnection,
  hideOrder, getSignup, getCodes, getDealer
}
