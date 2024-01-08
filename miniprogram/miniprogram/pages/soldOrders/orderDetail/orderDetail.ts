import { IAppOption } from "../../../models/index"
import { getSoldOrderWithCustomer } from '../../../services/api/api'
const app = getApp<IAppOption>()

Page({


  data: {
    order: null,
    activeNames: [0],
    percent: 0 as number
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function (option) {
    const todoOrder = await getSoldOrderWithCustomer(option.orderNumber, option.customerId)
    this.setData({
      order: todoOrder,
    })
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
  onAccordionChange(e) {
    this.setData({
      activeNames: e.detail,
    });
  }
})