// pages/register/register.ts
import { getSignup } from '../../services/api/api'
import { IAppOption } from "../../models/index"

const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({

  /**
   * Page initial data
   */
  data: {
    username: '',
    avatarUrl: defaultAvatarUrl,
    theme: wx.getSystemInfoSync().theme,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad() {
    wx.onThemeChange((result) => {
      this.setData({
        theme: result.theme
      })
    })
    const { user } = app.globalData
    if (user?.status === 'Active') {
      wx.navigateBack()
    }
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
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },
  onChangeUsername(e: any) {
    const { value } = e.detail
    this.setData({
      username: value,
    })
  },

  async onSubmit(e: any) {
    const { username } = e.detail.value
    if (!username || !this.data.avatarUrl || this.data.avatarUrl === defaultAvatarUrl) {
      wx.showToast({ title: '请补全信息', icon: 'none' })
      return
    }
    const result: any = await getSignup(username, this.data.avatarUrl)
    app.globalData.user = { ...app.globalData.user, ...JSON.parse(result) }
    wx.navigateBack()
  }
})