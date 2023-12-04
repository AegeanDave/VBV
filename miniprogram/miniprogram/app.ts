// app.ts
import { IAppOption } from './models/index'
import { getSession } from "./api/api"

App<IAppOption>({
  globalData: { sessionKey: "", reload: false, queryParameter: [], products: [] },
  onLaunch() {
    // 登录
    wx.login({
      success: async (res) => {
        wx.showLoading({
          title: '加载中'
        })
        if (res.code) {
          const result: any = await getSession(res.code)
          wx.setStorageSync('sessionKey', result.session_key)
          this.globalData.sessionKey = result.session_key
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(result)
          }
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '登录失败', icon: 'none'
          })
        }
        wx.hideLoading()
      },
    })
  },
})
