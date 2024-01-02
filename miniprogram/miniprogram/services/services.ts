import { updateUserInfo, getAuth } from "./api/api";
import { IAppOption } from "../models/index";
const app = getApp<IAppOption>()

const reLogin = () =>
  wx.login({
    success: async (res) => {
      if (res.code) {
        const result: any = await getAuth(res.code)
        wx.setStorageSync('sessionKey', result.session_key)
      } else {
        wx.showToast({
          title: '登录失败', icon: 'none'
        })
      }
    },
  })


const handleUpdateUserInfo = (userInfo) => {
  wx.setStorageSync('userInfo', userInfo)
  app.globalData.userInfo = userInfo
  updateUserInfo(app.globalData.userInfo as WechatMiniprogram.UserInfo)
}

export { handleUpdateUserInfo, reLogin }