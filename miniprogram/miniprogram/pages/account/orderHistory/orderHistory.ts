import { getAllPurchasedOrders } from '../../../services/api/api'
import { PurchasedOrder, OrderProduct, IAppOption } from "../../../models/index"
import { Status } from "../../../constant/index"
import { parseTime } from "../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    active: 0,
    pendingOrders: null,
    processingOrders: null
  },
  async onLoad() {
    let todoOrders: any
    if (!app.userInfoReadyCallback) {
      app.userInfoReadyCallback = async () => {
        todoOrders = await getAllPurchasedOrders()
      }
    }
    else {
      todoOrders = await getAllPurchasedOrders()
    }
    console.log(todoOrders)
    this.setData({
      pendingOrders: todoOrders.unpaidOrders || [],
      processingOrders: todoOrders.processingOrders || [],
    })
  },
  onTabChange(e: any) {
    this.setData({
      active: e.detail.index,
    })
  },
  bindToDetail(e: any) {
    wx.navigateTo({
      url: `./orderDetail/orderDetail?orderNumber=${e.currentTarget.dataset.order.orderNumber}`,
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
  onCheckPayment(e: any) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `./confirmOrder/confirmOrder?orderNumber=${order[0].orderNumber}`,
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