import { getAccount } from '../../services/api/api'
import { group } from "../../constant/index"
import { IAppOption } from "../../models/index"

const app = getApp<IAppOption>()

Page({
  data: {
    needToPay: false,
    waitForPayment: false,
    customerNum: 0,
    dealerNum: 0,
    hasWarehouse: false,
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
      avatarUrl: todoAccount.avatarUrl,
      hasWarehouse: !!todoAccount.warehouse
    })
  },
  onShow: async function () {
    if (app.globalData.reload) {
      const todoAccount: any = await getAccount()
      this.setData({
        account: todoAccount,
        username: app.globalData.user?.username,
        avatarUrl: app.globalData.user?.avatarUrl,
        hasWarehouse: !!todoAccount.warehouse
      })
      app.globalData.reload = false
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
    const { warehouse } = this.data.account
    if (warehouse?.status === 'Active') {
      wx.navigateTo({
        url: './warehouse/warehouse'
      })
    }
    else if (warehouse?.status === 'Not_Verified') {
      wx.navigateTo({
        url: `./warehouse/register/register?phone=${warehouse.loginPhoneNumber}`
      })
    } else {
      wx.navigateTo({
        url: './warehouse/register/register'
      })
    }
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