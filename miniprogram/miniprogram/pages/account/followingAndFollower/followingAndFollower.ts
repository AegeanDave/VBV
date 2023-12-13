import { getFathers, getChildren } from '../../../services/api/api'
import { IAppOption } from "../../../models/index"
import { group } from "../../../constant/index"

const app = getApp<IAppOption>()

Page({
  data: {
    groupName: '' as string,
    groupList: [],
    filterGroup: [],
    lookingUnpaid: false
  },
  onLoad: async function (options: any) {
    if (options.group === group.customer) {
      wx.setNavigationBarTitle({
        title: '我的客户端'
      })
    }
    else if (options.group === group.dealer) {
      wx.setNavigationBarTitle({
        title: '我的供应端'
      })
    }
    this.setData({
      groupName: options.group,
    })
  },
  onShow: async function () {
    let groupList: any
    if (this.data.groupName === group.customer) {
      groupList = await getChildren()
    }
    else if (this.data.groupName === group.dealer) {
      groupList = await getFathers()
    }
    this.setData({
      groupList: groupList.data
    })
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
  toDealer: function (e: any) {
    const dealer = e.currentTarget.dataset.dealer
    app.globalData.queryParameter.push(dealer)
    if(this.data.groupName===group.dealer){
      wx.navigateTo({
        url: './dealer/dealer'
      })
    }
    else{
      wx.navigateTo({
        url: './customer/customer'
      })
    }
  },
  toAlias(){
    wx.navigateTo({
      url: '../aliasCode/aliasCode'
    })
  }
})