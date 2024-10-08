import request from './request'

const getProductList = () => request.getRequest("products/all")
const getProduct = (id: string) => request.getRequest(`products/product/${id}`)
const getMyStore = () => request.getRequest("products/store/me")
const getDealerStores = () => request.getRequest("products/store/dealer")
const unpublishProduct = (product: Product) => request.postRequest("products/unpublish", { product: product })
const publishProduct = (product: Product) => request.postRequest("products/publish", { product })
const publishToStore = (product: any, newPrice: number) => request.postRequest("products/publish/new", { product, newPrice })
const updatePrice = (product: any, price: number) => request.postRequest("products/price", { product, price })
const updatePriceForChild = (price: number, openIdChild: string, product: any) => request.postRequest("products/price/special", { price: price, openIdChild, product })
const deleteProduct = (product: any) => request.deleteRequest("products/store/product", { product })
const generatePoster = (product: any, text: string, numOfImage: number) => request.bufferRequest("products/store/product/poster", { product, text, numOfImage })


export { getProductList, getMyStore, updatePrice, getProduct, publishProduct, unpublishProduct, publishToStore, updatePriceForChild, deleteProduct, getDealerStores, generatePoster }