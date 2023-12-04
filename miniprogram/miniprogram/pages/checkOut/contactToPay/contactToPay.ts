// pages/checkOut/contactToPay/contactToPay.js
import { IAppOption, Product } from "../../../models/index"
const app = getApp<IAppOption>()

Page({
  /**
   * Page initial data
   */
  data: {
    dealers: null
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {
    const dealerByOrder = app.globalData.queryParameter.pop()
    const allFathers: any = []
    dealerByOrder.forEach((orderProduct: Product) => {
      if (!allFathers.find((father: any) => father.openIDSource === orderProduct.dealerSale.openId)) {
        allFathers.push({ openIDSource: orderProduct.dealerSale.openId, name: orderProduct.dealerSale.name, avatar: orderProduct.dealerSale.avatar, payment: 0 })
      }
    })
    allFathers.forEach((father: any) => {
      dealerByOrder.forEach((orderProduct: Product) => {
        if (orderProduct.dealerSale.openId === father.openIDSource) {
          father.payment += orderProduct.quantity * (orderProduct.dealerSale.price as number)
        }
      })
      father.payment.toFixed(2)
    })
    this.setData({
      dealers: allFathers
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