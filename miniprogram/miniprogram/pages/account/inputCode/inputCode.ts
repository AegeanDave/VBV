import { makeNewConnection } from '../../../services/api/api'
import { IAppOption } from '../../../models/index'
import { Status } from '../../../constant/index'
const app = getApp<IAppOption>()

Page({
  data: {
    currentValue: ''
  },
  onLoad: function (options: any) {
    if (options?.code) {
      this.setData({
        currentValue: options.code,
      })
      this.handleConnection()
    }
  },
  handleConnection() {

  },
  onInputChange: function (e: any) {
    this.setData({
      currentValue: e.detail.value
    })
  },
  formSubmit: async function (e) {
    wx.showLoading({
      title: '加载中'
    })
    try {
      const result: any = await makeNewConnection(e.detail.value.code)
      wx.hideLoading()
      if (result.status === Status.FAIL) {
        wx.showToast({
          title: result.message,
          icon: 'error'
        })
        return
      }
      app.globalData.reload = true
      await wx.showToast({
        title: '关注成功',
        icon: 'success'
      })
      wx.navigateBack()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '关注失败',
        icon: "error"
      })
    }
  },
})