// pages/account/profile/profile.ts
import { IAppOption } from "../../../models/index"
import { getAddresses } from '../../../services/api/api'

const app = getApp<IAppOption>()

Page({

  /**
   * Page initial data
   */
  data: {
    username: null,
    avatarUrl: null,
    selectedAddress: null,
    hasId: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad() {
    const { addresses, hasId }: any = await getAddresses()
    this.setData({
      username: app.globalData.user?.username,
      avatarUrl: app.globalData.user?.avatarUrl,
      selectedAddress: addresses[0] || null,
      hasId: hasId
    })
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

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})