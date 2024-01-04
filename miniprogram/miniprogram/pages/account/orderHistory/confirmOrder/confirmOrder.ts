// pages/checkOut/contactToPay/contactToPay.js
import { getOrderResult } from '../../../../services/api/api'

Page({
  /**
   * Page initial data
   */
  data: {
    order: null,
    totalAmount: 0
  },
  /**
   * Lifecycle function--Called when page load
   */
  async onLoad(option) {
    const todoDealers = await getOrderResult(option.orderNumber)
    this.setData({
      dealers: todoDealers?.dealers,
      totalAmount: todoDealers?.dealers.reduce((sum, item) => {
        return sum + item.payment.payment.totalAmount
      }, 0)
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