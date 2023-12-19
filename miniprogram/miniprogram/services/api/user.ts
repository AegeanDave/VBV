import request from './request'

const getAuth = (code: string) => request.postRequest("users/login", { code })
const getSignup = (username: string, avatarUrl: string) => request.uploadImage("users/signup", avatarUrl, { username })
const getCodes = () => request.getRequest("users/my-codes")
const makeNewConnection = (code: string) => request.postRequest("users/new-connection", { code })
const getWarehouse = () => request.getRequest("warehouse/my-warehouse")
const getAccount = () => request.getRequest("users/account")
const getAlias = (group: 'DEALER' | 'CUSTOMER') => {
  if (group === 'CUSTOMER') {
    return request.getRequest("users/customers")
  }
  if (group === 'DEALER') {
    return request.getRequest("users/dealers")
  }
}
const createWarehouse = (phone: string, countryCode: string) => request.postRequest("warehouse/create", { phoneNumber: countryCode + phone, })
const getCustomer = (openId: string) => request.getRequest(`users/customer/${openId}`)
const getDealer = (openId: string) => request.getRequest(`users/dealer/${openId}`)
const removeConnection = (aliasId: string) => request.deleteRequest("users/connection", { id: aliasId })

export { getAuth, getSignup, getCodes, getWarehouse, makeNewConnection, getAccount, getAlias, createWarehouse, getCustomer, removeConnection, getDealer }