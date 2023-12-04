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
  onLoad: function (options) {
    const phone = options.phone
    this.setData({
      phone: phone
    })
  },
  bindResend: async function () {
    wx.redirectTo({
      url:'../setting/setting?phone=' + this.data.phone
    })
  },
  confirm() {
    wx.navigateBack({
      delta: 1
    })
  }
})