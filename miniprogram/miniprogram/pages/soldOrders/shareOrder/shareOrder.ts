import { Order, IAppOption } from "../../../models/index"

const app = getApp<IAppOption>()

Page({

  /**
   * Page initial data
   */
  data: {
    order: {} as Order
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function () {
    const order = app.globalData.queryParameter.pop()
    this.setData({
      order: order
    })
  },
  bindBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})