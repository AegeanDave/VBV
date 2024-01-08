import { updateUserInfo, getAuth } from "./api/api";
import { IAppOption } from "../models/index";
const app = getApp<IAppOption>()

const reLogin = () =>
  wx.login({
    success: async (res) => {
      if (res.code) {
        const result: any = await getAuth(res.code)
        wx.setStorageSync('sessionKey', result.session_key)
      }
    },
  })


export { reLogin }