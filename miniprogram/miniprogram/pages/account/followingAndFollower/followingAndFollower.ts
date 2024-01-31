import { getAlias } from '../../../services/api/api'
import { IAppOption } from "../../../models/index"
import { group } from "../../../constant/index"
import { parseTime } from '../../../utils/util'

const app = getApp<IAppOption>()

Page({
  data: {
    groupName: null,
    groupList: null,
    checkedList: [],
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
      groupList: todoAlias?.map((item: any) => ({
        ...item, createdAt: parseTime(new Date(item.createdAt))
      })) || [],
      groupName: options.group,
    })
  },
  onShow: async function () {
    if (app.globalData.reload) {
      const todoAlias = await getAlias(this.data.groupName)
      this.setData({
        groupList: todoAlias || []
      })
      app.globalData.reload = false
    }
  },
  bindCheck: function (e: any) {
    const UnpaidList = this.data.groupList.filter(item => item.hasUnpaidOrders === true)
    this.setData({
      checkedList: UnpaidList,
      lookingUnpaid: e.detail
    })
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