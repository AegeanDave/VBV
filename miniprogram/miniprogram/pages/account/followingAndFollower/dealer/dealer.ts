import { getDealer, unlockRelation } from '../../../../services/api/api'
import { Product, IAppOption, DealerOrder, OrderProduct } from "../../../../models/index"
import { Status, Mode } from "../../../../constant/index"
import { parseTime } from "../../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    dealer: undefined,
    active: 0,
    orders: null,
    products: null,
    valueUnpaid: 0 as number
  },
  onLoad: async function (option: any) {
    const { user, products, orders, unpaidAmount }: any = await getDealer(option.id)
    this.setData({
      orders: orders.map(order => ({
        ...order,
        createdAt: parseTime(new Date(order.createdAt))
      }
      )),
      products: products,
      dealer: user,
      valueUnpaid: unpaidAmount
    })
  },
  bindToDetail(e: any) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `../../orderHistory/orderDetail/orderDetail?orderNumber=${order.orderNumber}&dealerId=${order.dealerId}`,
    })
  },
  toProductDetail: function (e: any) {
    wx.navigateTo({
      url: `../../../index/productDetail/productDetail?mode=${Mode.PUBLISHING}&id=${e.currentTarget.dataset.product.id}`,
    })
  },
  disconnect: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定与“' + this.data.dealer.username + '”解除关系?',
      success: async function (sm) {
        if (sm.confirm) {
          const aliasID = that.data.dealer.aliasId
          const result = await unlockRelation(aliasID)
          if (result.status === Status.SUCCESS) {
            wx.showToast({
              title: '已解除关系',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function () {
              app.globalData.reload = true
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
          }
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  contactToPay: function () {
    let that = this
    wx.setClipboardData({
      data: that.data.dealer.username,
      success: function (res) {
        wx.showToast({
          title: '已复制卖家微信',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  toOrderShare: function (e: any) {
    const order = e.currentTarget.dataset.order
    order.name = this.data.customer.name
    app.globalData.queryParameter.push(e.currentTarget.dataset.order)
    wx.navigateTo({
      url: '../../orders/shareOrder/shareOrder',
    })
  }
})