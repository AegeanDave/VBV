// app.ts
import { IAppOption } from './models/index'
import { getAuth } from "./services/api/api"

App<IAppOption>({
  globalData: { reload: false },
  onLaunch() {
    // 登录
    wx.login({
      success: async ({ code }) => {
        if (!code) return
        try {
          const user: any = await getAuth(code)
          if (user.status === 'Not_Verified') {
            wx.navigateTo({ url: '/pages/register/register' })
          }
          wx.setStorageSync('sessionKey', user.token)
          this.globalData.user = user
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(user)
          }
        } catch (err) {
          wx.showToast({
            title: '连接服务器失败', icon: 'none', duration: 3000
          })
        }
      },
      fail() {
        wx.showToast({
          title: '登录失败', icon: 'none'
        })
      }
    })
  },
})
