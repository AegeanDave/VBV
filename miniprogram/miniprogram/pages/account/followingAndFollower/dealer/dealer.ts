import { getDealer, unlockRelation } from '../../../../services/api/api'
import { Product, IAppOption, DealerOrder, OrderProduct } from "../../../../models/index"
import { Status, Mode } from "../../../../constant/index"
import { parseTime } from "../../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    dealer: undefined,
    tab: 1 as number,
    orders: [],
    products: [] as Product[],
    valueUnpaid: 0 as number
  },
  onLoad: function (option: any) {
    this.setData({
      dealer: option.id
    })
    this.computeScrollViewHeight()
  },
  onShow: async function () {
    const { user, products, orders }: any = await getDealer(this.data.dealer)

    let unpaidAmount: number = 0
    orders.forEach((order: DealerOrder) => {
      order.createdAt = parseTime(new Date(order.createdAt))
      if (order.orderProducts) {
        order.totalPrice = Number(order.orderProducts.reduce((subSum: number, product: OrderProduct) => subSum + (product.price as number) * product.quantity, 0).toFixed(2))
        if (order.status === Status.UNPAID) {
          unpaidAmount += order.totalPrice
        }
      }
    })
    this.setData({
      orders: orders,
      products: products,
      dealer: user,
      valueUnpaid: unpaidAmount.toFixed(2)
    })
  },
  toChangeTab: function (e: any) {
    this.setData({
      tab: parseInt(e.currentTarget.dataset.tab),
    })
  },
  bindToDetail(e: any) {
    const order = e.currentTarget.dataset.order
    app.globalData.queryParameter.push(order)
    wx.navigateTo({
      url: '../../orders/orderDetail/orderDetail',
    })
  },
  computeScrollViewHeight() {
    let query = wx.createSelectorQuery().in(this)
    query.select('.header').boundingClientRect()
    query.select('.tabBar').boundingClientRect()
    query.exec(res => {
      let headerHeight = res[0].height
      let tabHeight = res[1].height
      let windowHeight = wx.getSystemInfoSync().windowHeight
      let scrollHeight = windowHeight - headerHeight - tabHeight
      this.setData({ scrollHeight: scrollHeight })
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
      data: that.data.dealer.name,
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