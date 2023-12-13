import request from './request'

const getProductList = () => request.getRequest("products/all")
const getMyStore = () => request.getRequest("products/my-store")

export { getProductList, getMyStore }