import { getAllPurchasedOrders } from '../../../services/api/api'
import { IAppOption } from "../../../models/index"
const app = getApp<IAppOption>()

Page({
  data: {
    showOrderValue: 0,
    sortingValue: 0,
    showOrderOptions: [
      { text: '未付款订单', value: 0 },
      { text: '已付款订单', value: 1 },
    ],
    sortingOptions: [
      { text: '日期排序↑', value: 0 },
      { text: '日期排序↓', value: 1 },
      { text: '仅五天内', value: 2 },
    ],
    pendingOrders: null,
    processingOrders: null,
  },
  async onLoad() {
    let todoOrders: any
    if (app.globalData.user) {
      todoOrders = await getAllPurchasedOrders()
    }
    else {
      app.userInfoReadyCallback = async () => {
        todoOrders = await getAllPurchasedOrders()
      }
    }
    this.setData({
      pendingOrders: todoOrders?.unpaidOrders || [],
      processingOrders: todoOrders?.processingOrders || [],
    })
  },
  onShowOrderChange(e: any) {
    this.setData({
      showOrderValue: e.detail
    })
  },
  onSortChange(e: any) {
    const sortOrderKey = this.data.showOrderValue === 0 ? 'pendingOrders' : 'processingOrders'
    switch (e.detail) {
      case 0:
        this.setData({
          [sortOrderKey]: this.data[sortOrderKey].map(item => {
            item[0].hidden = false
            return item
          }).sort((a: any, b: any) => new Date(a[0].createdAt) - new Date(b[0].createdAt))
        })
        break;
      case 1:
        this.setData({
          [sortOrderKey]: this.data[sortOrderKey].map((item: any) => {
            item[0].hidden = false
            return item
          }).sort((a, b) => new Date(b[0].createdAt) - new Date(a[0].createdAt))
        })
        break;
      case 2:
        this.setData({
          [sortOrderKey]: this.data[sortOrderKey].map(item => {
            const fiveDaysAgo = new Date().setDate(new Date().getDate() - 5)
            console.log(fiveDaysAgo < new Date(item[0].createdAt))
            if (fiveDaysAgo > new Date(item[0].createdAt)) {
              item[0].hidden = true
              return item
            }
            return item
          })
        })
        break;
      default:
        break;
    }
  },
  bindToDetail(e: any) {
    wx.navigateTo({
      url: `./orderDetail/orderDetail?orderNumber=${e.currentTarget.dataset.order.orderNumber}`,
    })
  },
  showModal: function (e: any) {
    let that = this;
    that.setData({
      showActionsheet: true,
      currentOrder: e.currentTarget.dataset.order
    })
  },
  bindShare() {
    wx.navigateTo({
      url: '../orders/shareOrder/shareOrder',
    })
  },
  onCheckPayment(e: any) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `./confirmOrder/confirmOrder?orderNumber=${order[0].orderNumber}`,
    })
  },
  closeActionsheet: function () {
    this.setData({
      showActionsheet: false
    })
  },
  btnClick(e: any) {
    switch (e.detail.value) {
      case 'SHARE':
        this.bindShare()
        break;
      default:
        break;
    }
    this.closeActionsheet()
  }
})