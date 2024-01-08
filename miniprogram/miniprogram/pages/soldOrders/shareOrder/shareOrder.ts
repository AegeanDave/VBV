import { IAppOption } from "../../../models/index"
import { getSoldOrderWithCustomer } from '../../../services/api/api'

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
  onLoad: async function (option: any) {
    const todoOrder = await getSoldOrderWithCustomer(option.orderNumber, option.userId)
    this.setData({
      order: todoOrder
    })
  },
  bindBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})