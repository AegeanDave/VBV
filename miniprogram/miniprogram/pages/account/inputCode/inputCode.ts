import { newRelation, updateUserInfo } from '../../../api/api'
import { handleUpdateUserInfo } from "../../../services/services";
import { IAppOption } from '../../../models/index'
import { Status } from '../../../constant/index'
const app = getApp<IAppOption>()

Page({
  data: {
    disabled: true,
    showPopup: false,
    currentValue: ''
  },
  onLoad: function (options: any) {
    this.setData({
      currentValue: options.code || '',
      disabled: options.code ? false : true
    })
    if (options.code) {
      this.handleSharedCode()
    }
  },
  handleSharedCode() {
    if (!app.userInfoReadyCallback) {
      app.userInfoReadyCallback = () => {
        if (!wx.getStorageSync('userInfo')) {
          this.setData({
            showPopup: !this.data.showPopup
          })
        }
        else {
          this.formSubmit()
        }
      }
    } else {
      if (!wx.getStorageSync('userInfo')) {
        this.setData({
          showPopup: !this.data.showPopup
        })
      }
      else {
        this.formSubmit()
      }
    }
  },
  inputValidation: function (e: any) {
    if (e.detail.value) {
      this.setData({
        disabled: false,
        currentValue: e.detail.value
      })
    }
    else {
      this.setData({
        disabled: true
      })
    }
  },
  bindGetUserInfo: function (e: any) {
    if (wx.getStorageSync('userInfo')) {
      this.formSubmit()
    }
    else {
      wx.getUserProfile({
        desc: '授权信息',
        success: res => {
          handleUpdateUserInfo(res.userInfo)
          this.setData({
            showPopup: false
          })
          this.formSubmit()
        },
        fail() {
          wx.showToast({
            title: '需要授权',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  formSubmit: async function () {
    wx.showLoading({
      title: '加载中',
    })
    const result: any = await newRelation(this.data.currentValue)
    if (result.status === Status.SUCCESS) {
      setTimeout(function () {
        wx.hideLoading()
        wx.showToast({
          title: '关注成功',
          icon: 'success',
          duration: 2000
        })
        app.globalData.reload = true
      }, 1000)
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
    else if (result.status === Status.FAIL) {
      wx.hideLoading()
      wx.showToast({
        title: result.messege,
        icon: 'none',
        duration: 2000
      })
    }
  },
})