import { getCodes, newCode, preOrder, charge } from '../../../services/api/api'
import { IAppOption } from '../../../models/index'
import { Status } from '../../../constant/index'
const app = getApp<IAppOption>()

Page({
  data: {
    showActionsheet: false,
    actionGroups: [
      { text: '复制', value: 0 },
      { text: '转发', value: 1 },
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
    const { value } = e.detail
    const that = this
    if (value === 0) {
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
        imageUrl: '../../image/artboard.jpg'
      }
    }
  },
  buyNew: async function () {
    wx.showLoading({
      title: '请稍后',
    })
    const prePay: any = await preOrder()
    if (prePay) {
      wx.hideLoading()
      try {
        const payResult = await charge(prePay)
        const result = await newCode()
        if (result.status !== Status.FAIL) {
          wx.showToast({
            title: '购买成功',
            icon: 'success',
            duration: 2000
          })
        }
        const updateCodes = this.data.unusedCodes
        updateCodes.unshift(result)
        this.setData({
          unusedCodes: updateCodes,
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