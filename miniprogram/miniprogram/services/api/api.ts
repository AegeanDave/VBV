import request from './request'
import { getProductList, getMyStore } from './product'
import { getAuth, getSignup, getCodes, getWarehouse } from './user'
import { Address, Product, SaleOrder } from "../../models/index"

const updateUserInfo = (userInfo: {}) => request.postRequest("users/updateUserInfo", userInfo)
const getFatherAndChildNumber = () => request.getRequest("users/fatherAndChildNumber")
const getAddress = () => request.getRequest("users/getAddress")
const addAddress = (address: Address, selectedField: number) => request.postRequest("users/newAddress", { address, selectedField })
const deleteAddress = (id: string) => request.deleteRequest("users/deleteAddress", { id: id })
const getFathers = () => request.getRequest("users/allFathers")
const getChildren = () => request.getRequest("users/allChildren")

const newCode = () => request.postRequest("users/newCode")
const newRelation = (code: string) => request.postRequest("users/newRelationship", { code: code })
const uploadImage = (filePath: string, id: string, imageSide: string) => request.uploadImage("users/uploadFile", filePath, id, imageSide)
const getCountriesData = () => request.getRequest("users/countries")
const submitOrder = (order: Product[], addressID: string, comment: string) => request.postRequest("orders/submitOrder", { order, addressID, comment })
const createWarehouse = (phone: string, countryCode: string) => request.postRequest("warehouse/createWarehouse", { phone: phone, countryCode: countryCode })
const updatePhone = (phone: string, countryCode: string) => request.postRequest("warehouse/updatePhone", { phone: phone, countryCode: countryCode })

const updateSale = (product: Product) => request.postRequest("products/updateSale", { product: product })
const unreleaseProduct = (product: Product) => request.postRequest("products/unreleaseProduct", { product: product })
const getOrdersFromFather = (openID: string) => request.postRequest("orders/myOrderFromFather", { openID: openID })
const getProductsFromFather = (openID: string) => request.postRequest("products/productsFromDealer", { openID: openID })
const getOrdersFromChild = (openID: string) => request.postRequest("orders/myOrderFromChild", { openID: openID })
const getMyPublishedProductsForChild = (openID: string) => request.postRequest("products/myPublishedProductsForChild", { openID: openID })
const unlockRelation = (aliasID: string) => request.deleteRequest("users/removeConnection", { id: aliasID })
const markPaid = (orders: SaleOrder[]) => request.postRequest("orders/markPaid", { orders: orders })
const updatePriceForChild = (price: number, openIdChild: string, inStoreProductId: string) => request.postRequest("products/updatePriceForChild", { price: price, openIdChild: openIdChild, inStoreProductId: inStoreProductId })
const getAllSaleOrders = () => request.getRequest("orders/allSaleOrders")
const getAllPurchaseOrders = () => request.getRequest("orders/myPurchase")
const cancelOrder = (order: SaleOrder) => request.postRequest("orders/cancelOrder", { order: order })
const hideOrder = (order: SaleOrder) => request.postRequest("orders/hideOrder", { order: order })
const getAddressByID = (id: string) => request.getRequest("users/getAddressByID", { id: id })
const preOrder = () => request.postRequest("orders/preOrder")
const charge = (params: object) => request.paymentRequest(params)
const getQRcode = (serialID: number) => request.getRequest("users/wxQRcode", { serialID: serialID })
const getProductInfoBySerialID = (serialID: number) => request.getRequest("products/productsBySerialID", { serialID: serialID })
const getUserInfo = () => request.getRequest("users/basicInfo")
const makeConnectionWithoutCode = (openIDFather: string) => request.postRequest("users/connectionWithoutCode", { openIDFather })


export {
  getAuth,
  updateUserInfo,
  getProductList,
  getFatherAndChildNumber,
  getAddress,
  getAddressByID,
  addAddress,
  deleteAddress,
  getFathers,
  getChildren,
  newCode,
  newRelation,
  getCountriesData,
  uploadImage,
  submitOrder,
  getMyStore,
  createWarehouse,
  updatePhone,
  getWarehouse,
  updateSale,
  unreleaseProduct,
  getOrdersFromFather,
  getProductsFromFather,
  getOrdersFromChild,
  getMyPublishedProductsForChild,
  unlockRelation,
  markPaid,
  updatePriceForChild,
  getAllSaleOrders,
  cancelOrder,
  preOrder,
  charge,
  getAllPurchaseOrders,
  getQRcode,
  getProductInfoBySerialID,
  getUserInfo,
  makeConnectionWithoutCode,
  hideOrder, getSignup, getCodes
}
