import { getCustomer, removeConnection, markPaid, updatePriceForChild } from '../../../../services/api/api'
import { Product, IAppOption, SaleOrder, OrderProduct } from "../../../../models/index"
import { Status } from "../../../../constant/index"
import { parseTime } from "../../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    customer: undefined,
    tab: 0 as number,
    orders: [],
    products: [] as Product[],
    valueUnpaid: 0 as number,
    showDialog: false,
    specialPrice: 0,
    selectedProduct: {},
    dialogButtons: [{
      type: 'default',
      text: '取消',
      value: 0
    }, {
      type: 'primary',
      text: '确定',
      value: 1
    }]
  },
  async onLoad(option) {
    const { user, products, orders }: any = await getCustomer(option.id)
    this.setData({
      customer: user,
      orders: orders,
      products: products,
    })
  },
  onShow: async function () {
    // const todoCustomer: any = await getCustomer(this.data.customer.openId)
    // let unpaidAmount: number = 0

    // this.setData({
    //   orders: ordersResult.data,
    //   products: productsResult.data,
    // })
  },
  onTabChange: function (e: any) {
    this.setData({
      tab: e.detail.index,
    })
  },
  bindToDetail(e: any) {
    const order = e.currentTarget.dataset.order
    app.globalData.queryParameter.push(order)
    wx.navigateTo({
      url: '../../orders/orderDetail/orderDetail',
    })
  },
  onShowDialog: function (e: any) {
    this.setData({
      selectedProduct: e.currentTarget.dataset.product,
      showDialog: true,
    })
  },
  disconnect: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定与“' + this.data.customer.username + '”解除关系?',
      success: async function (sm) {
        if (sm.confirm) {
          const aliasId = that.data.customer.openId
          const result = await removeConnection(aliasId)
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
  },
  onSpecialPriceChange(e) {
    this.setData({
      specialPrice: e.detail.value
    })
  }, async onDialogButtonTap(e) {
    if (e.detail.index === 1) {
      if (isNaN(this.data.specialPrice)) {
        wx.showToast({
          title: '输入有误',
          icon: 'error'
        })
        return
      }
      else {
        const todoPrice = await updatePriceForChild(this.data.specialPrice, this.data.customer.openId, this.data.selectedProduct)
      }
    }
    this.setData({
      showDialog: false
    })
  }
})