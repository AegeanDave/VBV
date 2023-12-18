import request from './request'

const getProductList = () => request.getRequest("products/all")
const getProduct = (id: string) => request.getRequest(`products/product/${id}`)
const getMyStore = () => request.getRequest("products/my-store")
const unpublishProduct = (product: Product) => request.postRequest("products/unreleaseProduct", { product: product })
export { getProductList, getMyStore, getProduct,unpublishProduct }