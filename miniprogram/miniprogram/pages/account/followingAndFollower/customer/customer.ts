import { getCustomer, removeConnection, markPaidAll, updatePriceForChild } from '../../../../services/api/api'
import { IAppOption } from "../../../../models/index"
import { Status } from "../../../../constant/index"
import { parseTime } from "../../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    customer: undefined,
    orders: null,
    products: null,
    valueUnpaid: 0 as number,
    showDialog: false,
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
  async onLoad(option: any) {
    const { user, products, orders, unpaidAmount }: any = await getCustomer(option.id)
    this.setData({
      customer: user,
      orders: orders.map((order: any) => ({
        ...order,
        createdAt: parseTime(new Date(order.createdAt))
      })),
      products: products,
      valueUnpaid: unpaidAmount
    })
  },

  onShow: function () {

  },
  bindToDetail(e: any) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `../../../soldOrders/orderDetail/orderDetail?orderNumber=${order.orderNumber}&customerId=${order.userId}`,
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
      data: that.data.customer.username,
      success: function (res) {
        wx.hideToast()
        wx.showToast({
          title: '已复制买家微信',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  toOrderShare: function (e: any) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `../../../soldOrders/shareOrder/shareOrder?userId=${order.userId}&orderNumber=${order.orderNumber}`,
    })
  },
  markPaid: function () {
    let that = this
    wx.showModal({
      content: '确认该好友已经结清欠款',
      cancelText: '否',
      confirmText: '是',
      success: async function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '更新中'
          })
          try {
            const result: any = await markPaidAll(that.data.customer.openId)
            wx.showToast({
              title: '已标记付款',
              icon: 'success',
              duration: 2000
            })
            that.setData({
              orders: result.data,
              valueUnpaid: 0
            })
            wx.hideLoading()
          } catch (err) {
            wx.hideLoading()
            wx.showToast({
              title: '更新失败'
            })
          }
        }
      }
    })
  },
  onSpecialPriceChange(e: any) {
    this.setData({
      specialPrice: e.detail
    })
  },
  async handleUpdatePrice() {
    try {
      await updatePriceForChild(this.data.specialPrice, this.data.customer.openId, this.data.selectedProduct)
      this.setData({
        products: this.data.products?.map(item => {
          if (item.id === this.data.selectedProduct.id) {
            return { ...item, specialPrice: [{ ...item.specialPrice[0], price: { price: this.data.specialPrice } }] }
          }
          return item
        })
      })
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } catch (err) {
      console.log(err)
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      })
    }
    this.setData({
      showDialog: false
    })
  },
  onPriceActionSheetClose() {
    this.setData({
      showDialog: false
    })
  }
})