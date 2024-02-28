import { getPurchasedOrder, getPurchasedOrderWithDealer, returnOrder } from '../../../../services/api/api'
import { IAppOption } from "../../../../models/index"
import Dialog from '@vant/weapp/dialog/dialog';

const app = getApp<IAppOption>()

Page({

  /**
   * Page initial data
   */
  data: {
    order: {},
    activeNames: [0],
    percent: 0 as number
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: async function (option: any) {
    if (option.dealerId) {
      const todoOrder = await getPurchasedOrderWithDealer(option.orderNumber, option.dealerId)
      this.setData({
        order: [todoOrder],
      })
    } else {
      const todoOrder = await getPurchasedOrder(option.orderNumber)
      this.setData({
        order: todoOrder,
      })
    }
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
  onAccordionChange(e: any) {
    this.setData({
      activeNames: e.detail,
    });
  },
  onCancelling(e: any) {
    const order = e.currentTarget.dataset.order
    Dialog.confirm({
      title: '确认取消对应的订单',
      message: '订单中的其余商品将保留',
    })
      .then(async() => {
        await returnOrder(order)
        wx.navigateBack()
      })
      .catch(() => {
        // on cancel
      });
  }
})