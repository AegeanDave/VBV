import { getUserInfo } from '../../services/api/api'
import { group, Status } from "../../constant/index"
import { IAppOption } from "../../models/index"

const app = getApp<IAppOption>()

Page({
  data: {
    needToPay: false,
    waitForPayment: false,
    fatherNumber: 0,
    childNumber: 0,
    hasWarehouse: null,
    username: '微信用户',
    avatarUrl: ''
  },
  onLoad() {
    this.setData({
      username: app.globalData.user?.username,
      avatarUrl: app.globalData.user?.avatarUrl
    })
  },
  onShow: async function () {
    const userInfoResult: any = await getUserInfo()
    if (userInfoResult.status === Status.SUCCESS) {
      const userInfo = userInfoResult.data
      this.setData({
        fatherNumber: userInfo.fatherNumber,
        childNumber: userInfo.childNumber
      })
      const fatherUnpaid = userInfo.fathersList.find((father: any) => father.ifUnpaid)
      const childrenUnpaid = userInfo.childrenList.find((child: any) => child.ifUnpaid)
      this.setData({
        needToPay: fatherUnpaid ? true : false,
        waitForPayment: childrenUnpaid ? true : false,
        hasWarehouse: (userInfo.warehouse.length > 0 ? true : false) as any
      })
    }
  },
  onNavigate(e: any) {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '../register/register'
      })
    }
    const { target: { dataset: { path } } } = e
    switch (path) {
      case 'customer':
        this.toCustomer()
        break;
      case 'dealer':
        this.toDealer()
        break;
      case 'warehouse':
        this.toWarehouse()
        break;
      case 'store':
        this.toStore()
        break;
      case 'order':
        this.toOrder()
        break;
      case 'history':
        this.toHistory()
        break;
      case 'invitation':
        this.toInvitation()
        break;
      case 'connection':
        this.toConnection()
        break;
      default:
        break;
    }
  },
  toCustomer: function () {
    return wx.navigateTo({
      url: `./followingAndFollower/followingAndFollower?group=${group.customer}`
    })
  },
  toDealer: function () {
    return wx.navigateTo({
      url: `./followingAndFollower/followingAndFollower?group=${group.dealer}`
    })
  },
  toInvitation: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE', 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc'],
      complete() {
        wx.navigateTo({
          url: './invitation/invitation'
        })
      }
    })
  },
  toOrder: function () {
    return wx.navigateTo({
      url: './orders/orders'
    })
  },
  toHistory: function () {
    return wx.navigateTo({
      url: './orderHistory/orderHistory'
    })
  },
  toStore: function () {
    return wx.navigateTo({
      url: '../store/store'
    })
  },
  toWarehouse: function () {
    wx.navigateTo({
      url: './warehouse/warehouse'
    })
  },
  toConnection: function () {
    wx.navigateTo({
      url: './inputCode/inputCode'
    })
  },
})