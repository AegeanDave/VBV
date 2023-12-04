import { updatePhone } from '../../../../api/api'
import { Status } from "../../../../constant/index"

Page({
  /**
   * Page initial data
   */
  data: {
    phone: undefined,
    newPhone: undefined,
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
    currentCode: 0,
    showPopup: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const phone = options.phone as string
    this.setData({
      phone: phone as any
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
      newPhone: e.detail.value
    })
  },
  handleChangeTab: function (e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({
      tab: index
    })
  },
  submitRegistration: async function (e: any) {
    const value = e.detail.value
    this.setData({
      showPopup: false
    })
    wx.showLoading({
      title: '正在提交',
    })
    const result = await updatePhone(value.phone, this.data.countryCodes[value.countryIndex].id)
    wx.hideLoading()
    if (result.status === Status.SUCCESS) {
      wx.navigateBack({
        delta: 1
      })
      wx.showToast({
        title: '修改成功',
        duration: 1500
      })
    } else {
      wx.showToast({
        title: '手机号有误',
        icon: 'none',
        duration: 1500
      })
    }
  },
  toConfirm(){
    this.setData({
      showPopup: true
    })
  },
  bindPickerChange: function (e: any) {
    this.setData({
      currentCode: e.detail.value
    })
  },
})