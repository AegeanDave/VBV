import { getCodes, newCode, preOrder, charge } from '../../../api/api'
import { handleUpdateUserInfo } from "../../../services/services";
import { IAppOption } from '../../../models/index'
import { Status } from '../../../constant/index'
const app = getApp<IAppOption>()

Page({
  data: {
    unusedCodes: [],
    usedCodes: [],
    hideModal: true
  },
  onLoad: async function () {
    const myCodes = await getCodes()
    this.setData({
      unusedCodes: myCodes[0].codes,
    })
  },
  onShow() {
    const updateUnusedCodes = this.data.unusedCodes
    const updateUsedCodes = this.data.usedCodes
    if (!updateUsedCodes.includes(this.data.currentCode) && this.data.currentCode) {
      updateUsedCodes.unshift(this.data.currentCode)
    }
    this.setData({
      unusedCodes: updateUnusedCodes.filter((code: string) => { return code !== this.data.currentCode }),
      usedCodes: updateUsedCodes
    })
    this.hideModal()
  },
  showModal: function (code) {
    let that = this;
    that.setData({
      hideModal: false,
      currentCode: code
    })
    let animation = wx.createAnimation({
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeIn();//调用显示动画
  },
  bindGetUserInfo: function (e: any) {
    if (wx.getStorageSync('userInfo')) {
      this.showModal(e.currentTarget.dataset.code)
    }
    else {
      wx.getUserProfile({
        desc: '授权信息',
        success: res => {
          handleUpdateUserInfo(res.userInfo)
          this.showModal(e.currentTarget.dataset.code)
        },
        fail() {
          wx.showToast({
            title: '需要授权',
            duration: 2000
          })
        }
      })
    }
  },
  hideModal: function () {
    let that = this
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 100)
  },

  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  bindCopy: function () {
    let that = this
    wx.setClipboardData({
      data: that.data.currentCode,
      success(res) {
        const updateUnusedCodes = that.data.unusedCodes
        const updateUsedCodes = that.data.usedCodes
        if (!updateUsedCodes.includes(that.data.currentCode)) {
          updateUsedCodes.unshift(that.data.currentCode)
        }
        that.setData({
          unusedCodes: updateUnusedCodes.filter((code: string) => { return code !== that.data.currentCode }),
          usedCodes: updateUsedCodes
        })
        that.hideModal()
      }
    })
  },
  onShareAppMessage: function (ops) {
    let that = this
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '快关注我的微帮微pro吧',
        path: '/pages/account/inputCode/inputCode?code=' + that.data.currentCode,
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