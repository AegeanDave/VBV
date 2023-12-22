import { Product, SaleOrder } from "../../models/index"
import request from './request'

const submitOrder = (items: Product[], addressId: string, comment: string) => request.postRequest("orders/new", { items, addressId, comment })
const markPaid = (orders: SaleOrder[]) => request.postRequest("orders/markPaid", { orders: orders })
const getAllSoldOrders = () => request.getRequest("orders/sold/all")
const getAllPurchasedOrders = () => request.getRequest("orders/purchase/all")
const getPurchasedOrder = (orderNumber: string) => request.getRequest(`orders/purchase`, { orderNumber })
const getPurchasedOrderWithDealer = (orderNumber: string, dealerId: string) => request.getRequest(`orders/purchase-dealer`, { orderNumber, dealerId })
const cancelOrder = (order: SaleOrder) => request.postRequest("orders/cancelOrder", { order })
const hideOrder = (order: SaleOrder) => request.postRequest("orders/hideOrder", { order })
const preOrder = () => request.postRequest("orders/preOrder")
const getOrderResult = (orderNumber: string) => request.getRequest('orders/contact', { orderNumber })
export {
  submitOrder, preOrder, hideOrder, cancelOrder, getAllPurchasedOrders, getAllSoldOrders, markPaid, getOrderResult, getPurchasedOrder,getPurchasedOrderWithDealer
}