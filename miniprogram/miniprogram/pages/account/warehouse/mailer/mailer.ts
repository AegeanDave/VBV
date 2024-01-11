// pages/account/warehouse/wareshouse.js
Page({

  /**
   * Page initial data
   */
  data: {
    phone: null,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options: any) {
    const phone = options.phone
    this.setData({
      phone: phone
    })
  },
  confirm() {
    wx.navigateBack({
      delta: 1
    })
  }
})