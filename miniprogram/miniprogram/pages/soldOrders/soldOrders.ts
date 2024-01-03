import { getAllSoldOrders, hideOrder, markPaid } from '../../services/api/api'
import { SaleOrder, IAppOption } from "../../models/index"
import { Status } from "../../constant/index"
import { parseTime } from "../../utils/util"

const app = getApp<IAppOption>()

Page({
  data: {
    activeTab: 0,
    unpaidOrders: null,
    paidOrders: null,
    completeOrders: null,
    isCommentEditing: false,
    showActionsheet: false,
    unPaidGroups: [
      { text: '联系付款', value: 'CONTACT' },
    ],
    paidGroups: [
      { text: '隐藏订单', value: 'CANCEL', type: 'warn' }
    ],
    shippedGroups: [
      { text: '隐藏订单', value: 'CANCEL', type: 'warn' }
    ]
  },
  async onLoad() {
    const { unpaid, paid, complete }: any = await getAllSoldOrders()
    this.setData({
      unpaidOrders: unpaid.map(order => ({
        ...order,
        createdAt: parseTime(new Date(order.createdAt))
      })) || [],
      paidOrders: paid.map(order => ({
        ...order,
        createdAt: parseTime(new Date(order.createdAt))
      })) || [],
      completeOrders: complete.map(order => ({
        ...order,
        createdAt: parseTime(new Date(order.createdAt))
      })) || []
    })
  },
  bindToDetail(e: any) {
    wx.navigateTo({
      url: `./orderDetail/orderDetail?orderNumber=${e.currentTarget.dataset.order.orderNumber}&customerId=${e.currentTarget.dataset.order.userId}`,
    })
  },
  handleOnEdit: function (e: any) {
    this.setData({
      isCommentEditing: true,
      editingOrderId: e.currentTarget.dataset.orderid
    })
  },
  showModal: function (e: any) {
    let that = this;
    that.setData({
      showActionsheet: true,
      currentOrder: e.currentTarget.dataset.order
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
      case 'CONTACT':
        this.bindCopy()
        break;
      case 'CANCEL':
        this.bindCancelOrder()
        break;
      default:
        break;
    }
    this.closeActionsheet()
  },

  markPaid: async function (e: any) {
    let that = this
    wx.showModal({
      title: '提示',
      content: '您确认标记付款并向上级经销商创建订单？',
      async success(res) {
        if (res.confirm) {
          let order = e.currentTarget.dataset.order
          const result: any = await markPaid([order])
          if (result.status === Status.SUCCESS) {
            wx.showToast({
              title: '标记成功',
            })
            order.status = Status.PAID
            that.setData({
              unpaidOrders: that.data.unpaidOrders.filter(item => item.id !== order.id),
              paidOrders: [...that.data.paidOrders, order]
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  handleChangeComment(e: any) {
    const input = e.detail.value
    const currentOrder = e.currentTarget.dataset.order
    this.setData({
      unpaidOrders: this.data.unpaidOrders.map((order: any) => {
        if (order.id === currentOrder.id) {
          order.newComment = input
        }
      }),
      isCommentEditing: false
    })
  },
  bindCancelOrder() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '您确认隐藏此订单？',
      async success(res) {
        if (res.confirm) {
          const order = that.data.currentOrder
          const result: any = await hideOrder(order)
          if (result.status === Status.SUCCESS) {
            wx.showToast({
              title: '订单已隐藏',
              icon: 'success',
              duration: 2000
            })
            const updateShippingOrders = that.data.tabs[2].orders.filter((currentOrder: SaleOrder) => currentOrder.orderId !== order.orderId)
            const updatePaidOrders = that.data.tabs[1].orders.filter((currentOrder: SaleOrder) => currentOrder.orderId !== order.orderId)
            that.setData({
              ['tabs[1].orders']: updatePaidOrders,
              ['tabs[2].orders']: updateShippingOrders
            })
          } else {
            wx.showToast({
              title: '操作失败',
              icon: 'none',
              duration: 2000
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  bindCopy(e: any) {
    let that = this
    wx.setClipboardData({
      data: e ? e.currentTarget.dataset.name : that.data.currentOrder.buyer.name,
      success: function () {
        wx.showToast({
          title: '已成功复制',
          icon: 'success',
          duration: 2000
        })
      },
      fail() {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})