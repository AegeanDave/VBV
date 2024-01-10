import { getCodes, preOrder, charge } from '../../../services/api/api'
import { IAppOption } from '../../../models/index'
import { Status } from '../../../constant/index'
const app = getApp<IAppOption>()

Page({
  data: {
    showActionsheet: false,
    actionGroups: [
      { name: '微信', icon: 'wechat', openType: 'share' },
      { name: '复制链接', icon: 'link' },
    ],
    selectedCode: '',
    activeCodes: [],
    InactiveCodes: []
  },
  onLoad: async function () {
    const myCodes: any = await getCodes()
    this.setData({
      activeCodes: myCodes.filter((code: any) => code.status === 'Active'),
      InactiveCodes: myCodes.filter((code: any) => code.status === 'Inactive')
    })
  },
  open(e) {
    this.setData({
      showActionsheet: true,
      selectedCode: e.currentTarget.dataset.code
    })
  },
  onTrigger(e) {
    const { index } = e.detail
    const that = this
    if (index === 1) {
      wx.setClipboardData({
        data: this.data.selectedCode,
        success() {
          wx.showToast({ title: '成功复制', icon: 'success' })
          that.setData({
            showActionsheet: false
          })
        }
      })
    }
  },
  onShareAppMessage: function (ops) {
    let that = this
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '快关注我的微帮微吧',
        path: '/pages/account/inputCode/inputCode?code=' + that.data.selectedCode,
        imageUrl: '/image/artboard.jpg'
      }
    }
  },
  onActionSheetClose() {
    this.setData({ showActionsheet: false });
  },
  buyNew: async function () {
    wx.showLoading({
      title: '请稍后',
    })
    const prePay: any = await preOrder()
    if (prePay) {
      wx.hideLoading()
      try {
        await charge(prePay)
        wx.showToast({
          title: '购买成功',
          icon: 'success',
          duration: 2000
        })
      } catch (error) {
        wx.showToast({
          title: '购买失败',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.showToast({
        title: '服务器信息有误',
        duration: 2000
      })
    }
  }
})