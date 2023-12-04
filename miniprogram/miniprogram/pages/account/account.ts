import { getUserInfo } from '../../api/api'
import { group, Status } from "../../constant/index"

Page({
  data: {
    needToPay: false,
    waitForPayment: false,
    fatherNumber: 0,
    childNumber: 0,
    hasWarehouse: null
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
  toFollower: function () {
    wx.navigateTo({
      url: './followingAndFollower/followingAndFollower?group=' + group.customer
    })
  },
  toFollowing: function () {
    wx.navigateTo({
      url: './followingAndFollower/followingAndFollower?group=' + group.dealer
    })
  },
  toAliasCode: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE', 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc'],
      complete(){
        wx.navigateTo({
          url: './aliasCode/aliasCode'
        })
      }
    })
  },
  toOrder: function () {
    wx.navigateTo({
      url: './orders/orders'
    })
  },
  toHistory: function () {
    wx.navigateTo({
      url: './orderHistory/orderHistory'
    })
  },
  toStore: function () {
    wx.navigateTo({
      url: './store/store'
    })
  },
  toWarehouse: function () {
    wx.navigateTo({
      url: './warehouse/warehouse'
    })
  },
  toInputCode: function () {
    wx.navigateTo({
      url: './inputCode/inputCode'
    })
  },
})