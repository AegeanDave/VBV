import request from './request'

const getProductList = () => request.getRequest("products/all")
const getProduct = (id: string) => request.getRequest(`products/product/${id}`)
const getMyStore = () => request.getRequest("products/my-store")
const unpublishProduct = (product: Product) => request.postRequest("products/unpublish", { product: product })
const publishProduct = (product: Product) => request.postRequest("products/publish", { product })
const publishToStore = (product: any, newPrice: number) => request.postRequest("products/publish/new", { product, newPrice })
const updatePrice = (product: any, price: number) => request.postRequest("products/price", { product, price })
const updatePriceForChild = (price: number, openIdChild: string, product: any) => request.postRequest("products/price/special", { price: price, openIdChild, product })


export { getProductList, getMyStore, updatePrice, getProduct, publishProduct, unpublishProduct, publishToStore, updatePriceForChild }