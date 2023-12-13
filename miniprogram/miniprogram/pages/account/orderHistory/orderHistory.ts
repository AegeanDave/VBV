import { getAllPurchaseOrders, markPaid } from '../../../services/api/api'
import { PurchasedOrder, OrderProduct, IAppOption } from "../../../models/index"
import { Status } from "../../../constant/index"
import { parseTime } from "../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    tabs: [
      {
        name: '未付款订单',
        id: 0 as number,
        orders: [] as PurchasedOrder[]
      },
      {
        name: '已付款订单',
        id: 1 as number,
        orders: [] as PurchasedOrder[]
      }
    ],
    currentTab: 0 as number,
    currentOrder: {} as PurchasedOrder,
  },
  async onLoad() {
    if (!app.userInfoReadyCallback) {
      app.userInfoReadyCallback = async () => {
        const orderResult:any = await getAllPurchaseOrders()
        this.initialOrders(orderResult.data)
      }
    }
    else {
      const orderResult:any = await getAllPurchaseOrders()
      this.initialOrders(orderResult.data)
    }
  },
  initialOrders(orders: PurchasedOrder[]) {
    const tabs = this.data.tabs
    orders.forEach((order: PurchasedOrder) => {
      order.createdAt = parseTime(new Date(order.createdAt))
      order.totalPrice = order.subOrders.reduce((sum: number, subOrder: any) => sum + subOrder.orderProducts ? subOrder.orderProducts.reduce((subSum: number, product: OrderProduct) => subSum + (product.price as number) * product.quantity, 0) : 0, 0).toFixed(2)
      if (order.subOrders.find((subOrder: any) => subOrder.status === Status.UNPAID)) {
        tabs[0].orders.push(order)
      } else {
        tabs[1].orders.push(order)
      }
    })
    this.setData({
      tabs: tabs
    })
  },
  switchTab(e: any) {
    this.setData({
      currentTab: e.detail.current,
    })
  },
  bindToDetail(e: any) {
    app.globalData.queryParameter.push(e.currentTarget.dataset.order)
    wx.navigateTo({
      url: './orderDetail/orderDetail',
    })
  },
  toChangeTab: function (e: any) {
    this.setData({
      currentTab: parseInt(e.currentTarget.dataset.tab),
    })
  },
  showModal: function (e: any) {
    let that = this;
    that.setData({
      showActionsheet: true,
      currentOrder: e.currentTarget.dataset.order
    })
  },
  bindShare() {
    app.globalData.queryParameter.push(this.data.currentOrder)
    wx.navigateTo({
      url: '../orders/shareOrder/shareOrder',
    })
  },
  toConfirmPayment(e: any) {
    const order = e.currentTarget.dataset.order
    app.globalData.queryParameter.push(order)
    wx.navigateTo({
      url: './confirmOrder/confirmOrder',
    })
  },
  closeActionsheet: function () {
    this.setData({
      showActionsheet: false
    })
  },
  btnClick(e: any) {
    switch (e.detail.value) {
      case 'SHARE':
        this.bindShare()
        break;
      default:
        break;
    }
    this.closeActionsheet()
  }
})