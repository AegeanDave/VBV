import { SaleOrder, PurchasedOrder, DealerOrder, Product, IAppOption } from "../../../models/index"

const app = getApp<IAppOption>()

Page({

  /**
   * Page initial data
   */
  data: {
    order: {},
    percent: 0 as number
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function () {
    const order: SaleOrder | PurchasedOrder | DealerOrder = app.globalData.queryParameter.pop()
    this.setData({
      order: order,
    })
  },
  bindCopy(e: any) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.name,
      success: function () {
        wx.hideToast()
        wx.showToast({
          title: '已成功复制',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  showDetail(e: any) {
    const updateArrayLabel = `order.subOrders[${e.currentTarget.dataset.firstindex}].orderProducts[${e.currentTarget.dataset.secondindex}].showDetail`
    this.setData({
      [updateArrayLabel]: e.currentTarget.dataset.showdetail
    })
  }
})