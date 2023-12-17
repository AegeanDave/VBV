import request from './request'

const getProductList = () => request.getRequest("products/all")
const getProduct = (id: string) => request.getRequest(`products/product/${id}`)
const getMyStore = () => request.getRequest("products/my-store")

export { getProductList, getMyStore, getProduct }