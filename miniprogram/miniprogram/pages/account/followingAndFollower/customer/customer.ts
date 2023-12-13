import { getOrdersFromChild, getMyPublishedProductsForChild, unlockRelation, markPaid } from '../../../../services/api/api'
import { Product, IAppOption, SaleOrder, OrderProduct } from "../../../../models/index"
import { Status, Mode } from "../../../../constant/index"
import { parseTime } from "../../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    customer: undefined,
    tab: 1 as number,
    orders: [],
    products: [] as Product[],
    valueUnpaid: 0 as number
  },
  onLoad: function () {
    this.setData({
      customer: app.globalData.queryParameter.pop(),
    })
    this.computeScrollViewHeight()
  },
  onShow: async function () {
    const ordersResult: any = await getOrdersFromChild(this.data.customer.openId)
    const productsResult: any = await getMyPublishedProductsForChild(this.data.customer.openId)
    let unpaidAmount: number = 0
    ordersResult.data.forEach((order: SaleOrder) => {
      order.createdAt = parseTime(new Date(order.createdAt))
      if (order.subOrders) {
        order.totalPrice = Number(order.subOrders.reduce((sum: number, subOrder: any) => sum + subOrder.orderProducts ? subOrder.orderProducts.reduce((subSum: number, product: OrderProduct) => subSum + (product.price as number) * product.quantity, 0) : 0, 0).toFixed(2))
        if (order.status === Status.UNPAID) {
          unpaidAmount += order.totalPrice
        }
      }
    })
    this.setData({
      orders: ordersResult.data,
      products: productsResult.data,
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
    if (this.data.dealer) {
      app.globalData.queryParameter.push(e.currentTarget.dataset.product)
      wx.navigateTo({
        url: '../../../index/productDetail/productDetail?mode=' + Mode.UPDATE_PRICE_DEFAULT,
      })
    }
  },
  updateChildPrice: function (e: any) {
    let product = e.currentTarget.dataset.product
    product.saleChild = this.data.customer.openId
    app.globalData.queryParameter.push(product)
    wx.navigateTo({
      url: '../../../index/productDetail/productDetail?mode=' + Mode.UPDATE_PRICE_CHILD,
    })
  },
  disconnect: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定与“' + this.data.customer.name + '”解除关系?',
      success: async function (sm) {
        if (sm.confirm) {
          const aliasId = that.data.customer.aliasId
          const result = await unlockRelation(aliasId)
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
      data: that.data.customer.name,
      success: function (res) {
        wx.hideToast()
        wx.showToast({
          title: that.data.dealer ? '已复制卖家微信' : '已复制买家微信',
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
  },
  markPaid: function () {
    let that = this
    const unpaidOrder = this.data.orders.filter((item: any) => item.status === Status.UNPAID)
    wx.showModal({
      content: '确认该好友已经结清欠款',
      cancelText: '否',
      confirmText: '是',
      success: async function (res) {
        if (res.confirm) {
          const result: any = await markPaid(unpaidOrder)
          if (result.status === Status.SUCCESS) {
            wx.showToast({
              title: '已标记付款',
              icon: 'success',
              duration: 2000
            })
          }
          const ordersResult: any = await getOrdersFromChild(that.data.customer.openId)
          let unpaidAmount: number = 0
          ordersResult.data.forEach((order: SaleOrder) => {
            order.createdAt = parseTime(new Date(order.createdAt))
            if (order.subOrders) {
              order.totalPrice = Number(order.subOrders.reduce((sum: number, subOrder: any) => sum + subOrder.orderProducts ? subOrder.orderProducts.reduce((subSum: number, product: OrderProduct) => subSum + (product.price as number) * product.quantity, 0) : 0, 0).toFixed(2))
              if (order.status === Status.UNPAID) {
                unpaidAmount += order.totalPrice
              }
            }
          })
          that.setData({
            orders: ordersResult.data,
            valueUnpaid: unpaidAmount
          })
        }
      }
    })
  }
})