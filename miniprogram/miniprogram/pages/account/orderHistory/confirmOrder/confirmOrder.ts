// pages/checkOut/contactToPay/contactToPay.js
import { IAppOption, OrderProduct } from "../../../../models/index"
const app = getApp<IAppOption>()

Page({
  /**
   * Page initial data
   */
  data: {
    order: null
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {
    const orderByDealer = app.globalData.queryParameter.pop()
    orderByDealer.subOrders.forEach((subOrder: any) => {
      subOrder.sum = subOrder.orderProducts.reduce((subSum: number, b: OrderProduct) => subSum + (b.price as number) * b.quantity, 0).toFixed(2)
    })
    this.setData({
      order: orderByDealer
    })
  },
  toContact(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.dealer,
      success: function (res) {
        wx.hideToast()
        wx.showToast({
          title: '已复制卖家微信',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  toHome() {
    wx.switchTab({
      url: '../../index/index'
    })
  }
})