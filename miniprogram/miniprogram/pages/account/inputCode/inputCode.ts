import { makeNewConnection } from '../../../services/api/api'
import { IAppOption } from '../../../models/index'
import { Status } from '../../../constant/index'
const app = getApp<IAppOption>()

Page({
  data: {
    showPopup: false,
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
    const result: any = await makeNewConnection(e.detail.value.code)
    if (result.status === Status.SUCCESS) {
      app.globalData.reload = true
      wx.showToast({
        title: '关注成功',
        icon: 'success'
      })
      wx.navigateBack()
    }
    if (result.status === Status.FAIL) {
      wx.showToast({
        title: result.message,
        icon: "error"
      })
    }
  },
})