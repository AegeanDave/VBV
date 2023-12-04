import { IAppOption } from "../../../../models/index"
import { Image, Status } from "../../../../constant/index"
import { uploadImage } from '../../../../api/api'
const app = getApp<IAppOption>()

Page({
  data: {
    tempFilePaths: [null, null]
  },
  onLoad: function () {

  },
  chooseImage: function (e: any) {
    let that = this
    const index = e.currentTarget.dataset.index
    let count = !that.data.tempFilePaths[0] && !that.data.tempFilePaths[1] ? 2 : 1
    wx.chooseImage({
      count: count,
      sourceType: ['album', 'camera'],
      success: function (res) {
        if (!that.data.tempFilePaths[0] && !that.data.tempFilePaths[1]) {
          that.setData({
            tempFilePaths: res.tempFilePaths
          })
        }
        else {
          if (index === '0') {
            let newFilePaths = that.data.tempFilePaths
            newFilePaths[0] = res.tempFilePaths[0]
            that.setData({
              tempFilePaths: newFilePaths
            })
          }
          else {
            let newFilePaths = that.data.tempFilePaths
            newFilePaths[1] = res.tempFilePaths[0]
            that.setData({
              tempFilePaths: newFilePaths
            })
          }
        }
      }
    })
  },
  reduce: function (e) {
    const index = e.currentTarget.dataset.index
    let newFilePaths = this.data.tempFilePaths
    newFilePaths[index] = null
    this.setData({
      tempFilePaths: newFilePaths
    })
  },
  upload: async function () {
    const filePaths: string[] = this.data.tempFilePaths
    let result = []
    let uploadSuccess: boolean = false
    const addressId = app.globalData.addressList[app.globalData.currentAddress].addressId
    wx.showLoading({
      title: '正在上传',
    })
    for (let i = 0; i < filePaths.length; i++) {
      const imageSide: string = i === 0 ? Image.FRONT : i === 1 && Image.BACK
      const uploadResult = await uploadImage(filePaths[i], addressId, imageSide)
      if (uploadResult !== Status.FAIL) {
        result.push(uploadResult)
        uploadSuccess = true
      }
      else {
        uploadSuccess = false
        break;
      }
    }
    if (uploadSuccess) {
      wx.hideLoading()
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
      setTimeout(function () {
        result.forEach(item => {
          if (!app.globalData.addressList[app.globalData.currentAddress].idFrontImage) {
            app.globalData.addressList[app.globalData.currentAddress].idFrontImage = item
          }
          else if (!app.globalData.addressList[app.globalData.currentAddress].idBackImage) {
            app.globalData.addressList[app.globalData.currentAddress].idBackImage = item
          }
        })
        wx.navigateBack({
          delta: 1
        })
      }, 1000)
    }
    else {
      wx.showToast({
        title: '上传失败',
        icon: 'none',
        duration: 2000
      })
    }
  }
})