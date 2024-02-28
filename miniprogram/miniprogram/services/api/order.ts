import { Product, SaleOrder } from "../../models/index"
import request from './request'

const submitOrder = (items: Product[], addressId: string, comment: string) => request.postRequest("orders/new", { items, addressId, comment })
const markPaid = (orders: SaleOrder[], newComment?: string) => request.postRequest("orders/mark-paid", { orders, newComment })
const markPaidAll = (userId: string) => request.postRequest("orders/mark-paid/all", { userId })
const getAllSoldOrders = () => request.getRequest("orders/sold/all")
const getSoldOrder = (orderNumber: string) => request.getRequest("orders/sold", { orderNumber })
const getSoldOrderWithCustomer = (orderNumber: string, customerId) => request.getRequest("orders/sold-customer", { orderNumber, customerId })
const getAllPurchasedOrders = () => request.getRequest("orders/purchase/all")
const getPurchasedOrder = (orderNumber: string) => request.getRequest(`orders/purchase`, { orderNumber })
const getPurchasedOrderWithDealer = (orderNumber: string, dealerId: string) => request.getRequest(`orders/purchase-dealer`, { orderNumber, dealerId })
const cancelOrder = (order: SaleOrder) => request.postRequest("orders/cancelOrder", { order })
const deleteOrder = (order: SaleOrder) => request.deleteRequest("orders/", { order })
const hideOrder = (order: SaleOrder) => request.postRequest("orders/action", { order, action: 'hide' })
const completeOrder = (order: SaleOrder) => request.postRequest("orders/action", { order, action: 'complete' })
const returnOrder = (order: SaleOrder) => request.postRequest("orders/action", { order, action: 'return' })
const getOrderResult = (orderNumber: string) => request.getRequest('orders/contact', { orderNumber })
const getInstance = () => request.getRequest('orders/pay/instance')

export {
  submitOrder, deleteOrder, cancelOrder, getAllPurchasedOrders, getAllSoldOrders, markPaid, getOrderResult, getPurchasedOrder, getPurchasedOrderWithDealer, getSoldOrderWithCustomer, getSoldOrder, getInstance, markPaidAll, completeOrder, hideOrder, returnOrder
}