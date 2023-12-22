import { getAlias } from '../../../services/api/api'
import { IAppOption } from "../../../models/index"
import { group } from "../../../constant/index"

const app = getApp<IAppOption>()

Page({
  data: {
    groupName: null,
    groupList: [],
    filterGroup: [],
    lookingUnpaid: false
  },
  onLoad: async function (options: any) {
    if (options.group === group.customer) {
      wx.setNavigationBarTitle({
        title: '我的客户'
      })
    }
    else if (options.group === group.dealer) {
      wx.setNavigationBarTitle({
        title: '我的供应'
      })
    }
    const todoAlias = await getAlias(options.group)
    this.setData({
      groupList: todoAlias,
      groupName: options.group,
    })
  },
  onShow: async function () {
    if (app.globalData.reload) {
      const todoAlias = await getAlias(this.data.groupName)
      this.setData({
        groupList: todoAlias
      })
    }
  },
  bindFilter: function () {
    if (!this.data.lookingUnpaid) {
      const Unpaid = this.data.groupList.filter(item => item.ifUnpaid === true)
      this.setData({
        filterGroup: Unpaid,
        lookingUnpaid: true
      })
    }
    else {
      this.setData({
        filterGroup: [],
        lookingUnpaid: false
      })
    }
  },
  toAlias: function (e: any) {
    const alias = e.currentTarget.dataset.alias
    if (this.data.groupName === group.dealer) {
      wx.navigateTo({
        url: `./dealer/dealer?id=${alias.openId}`
      })
    }
    else {
      wx.navigateTo({
        url: `./customer/customer?id=${alias.openIdChild}`
      })
    }
  },
  toInvitation() {
    wx.navigateTo({
      url: '../invitation/invitation'
    })
  }
})