import { getAccount } from '../../services/api/api'
import { group, Status } from "../../constant/index"
import { IAppOption } from "../../models/index"

const app = getApp<IAppOption>()

Page({
  data: {
    needToPay: false,
    waitForPayment: false,
    customerNum: 0,
    dealerNum: 0,
    hasWarehouse: null,
    username: app.globalData.user?.username,
    avatarUrl: app.globalData.user?.avatarUrl
  },
  async onLoad() {
    const todoAccount: any = await getAccount()
    this.setData({
      account: todoAccount,
      customerNum: todoAccount.customer.length,
      dealerNum: todoAccount.dealer.length,
      username: todoAccount.username,
      avatarUrl: todoAccount.avatarUrl
    })
  },
  onShow: async function () {
    if (app.globalData.reload) {
      const todoAccount: any = await getAccount()
      this.setData({
        account: todoAccount,
        username: app.globalData.user?.username,
        avatarUrl: app.globalData.user?.avatarUrl
      })
    }
  },
  toCustomer: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    wx.navigateTo({
      url: `./followingAndFollower/followingAndFollower?group=${group.customer}`
    })
  },
  toDealer: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    wx.navigateTo({
      url: `./followingAndFollower/followingAndFollower?group=${group.dealer}`
    })
  },
  toInvitation: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    wx.navigateTo({
      url: './invitation/invitation'
    })
  },
  toOrder: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    return wx.navigateTo({
      url: '../soldOrders/soldOrders'
    })
  },
  toHistory: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    return wx.navigateTo({
      url: './orderHistory/orderHistory'
    })
  },
  toStore: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    return wx.navigateTo({
      url: '../store/store'
    })
  },
  toWarehouse: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    wx.navigateTo({
      url: './warehouse/warehouse'
    })
  },
  toConnection: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    wx.navigateTo({
      url: './inputCode/inputCode'
    })
  },
})