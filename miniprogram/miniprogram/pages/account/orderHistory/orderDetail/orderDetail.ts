import { getPurchasedOrder, getPurchasedOrderWithDealer } from '../../../../services/api/api'
import { IAppOption } from "../../../../models/index"
const app = getApp<IAppOption>()

Page({

  /**
   * Page initial data
   */
  data: {
    order: {},
    activeNames: ['0'],
    percent: 0 as number
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function (option: any) {
    if (option.dealerId) {
      const todoOrder = await getPurchasedOrderWithDealer(option.orderNumber, option.dealerId)
      this.setData({
        order: [todoOrder],
      })
    } else {
      const todoOrder = await getPurchasedOrder(option.orderNumber)
      this.setData({
        order: todoOrder,
      })
    }
  },
  bindCopy(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.name,
      success: function () {
        wx.hideToast()
        wx.showToast({
          title: '已成功复制',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  onAccordionChange(e: any) {
    this.setData({
      activeNames: e.detail,
    });
  }
})