import { Address, IAppOption } from "../../../models/index"
import { deleteAddress } from '../../../api/api'
const app = getApp<IAppOption>()

Page({
  data: {
    currentAddress: 0 as number,
    addressList: [] as Address[],
  },
  onShow() {
    this.setData({
      currentAddress: app.globalData.currentAddress,
      addressList: app.globalData.addressList
    })
  },
  addNewAddress: function () {
    wx.navigateTo({
      url: '../newAddress/newAddress'
    })
  },
  useThisAddress: function (e) {
    app.globalData.currentAddress = e.currentTarget.dataset.address
    this.setData({
      currentAddress: app.globalData.currentAddress,
    })
  },
  deleteAddress: async function (e: any) {
    const result = await deleteAddress(e.currentTarget.dataset.address)
    if (result.count === 1) {
      const newList = app.globalData.addressList.filter(function (value, index, arr) {
        return value.id !== e.currentTarget.dataset.address
      })
      app.globalData.addressList = newList
      this.setData({
        addressList: newList,
        currentAddress: app.globalData.currentAddress,
      })
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      })
    }
  },
})