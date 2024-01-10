import { createWarehouse } from '../../../../services/api/api'


Page({

  /**
   * Page initial data
   */
  data: {
    currentCode: 0,
    showPopup: false,
    phone: '',
    disabled: true,
    countryCodes: [{
      id: 'CN',
      name: '中国',
      value: '86'
    }, {
      id: 'CA',
      name: '加拿大',
      value: '1'
    }, {
      id: 'US',
      name: '美国',
      value: '1'
    }],
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad() {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },


  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },
  bindPickerChange: function (e: any) {
    this.setData({
      currentCode: e.detail.value
    })
  },
  handleValidation: function (e: any) {
    if (e.detail.value && e.detail.value.length >= 10) {
      this.setData({
        disabled: false
      })
    }
    else {
      this.setData({
        disabled: true
      })
    }
    this.setData({
      phone: e.detail.value
    })
  },
  async onDialogTap(e: any) {
    const { detail: { index } } = e
    if (index === 1) {
      const result = await createWarehouse(this.data.phone, this.data.countryCodes[this.data.currentCode].value)
      this.setData({
        showPopup: false
      })
      if (result?.status === 'FAIL') {
        wx.showToast({
          title: '创建失败',
          icon: 'error',
          duration: 2000
        })
        return
      }
      wx.redirectTo({url:`./mailer/mailer?phone=${this.data.phone}`})
    }
    else {
      this.setData({
        showPopup: false
      })
    }
  },
  toConfirm() {
    this.setData({
      showPopup: true
    })
  },
})