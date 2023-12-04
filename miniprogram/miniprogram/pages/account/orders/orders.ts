import { getAllSaleOrders, hideOrder, markPaid } from '../../../api/api'
import { SaleOrder, IAppOption, OrderProduct } from "../../../models/index"
import { Status } from "../../../constant/index"
import { parseTime } from "../../../utils/util"
const app = getApp<IAppOption>()

Page({
  data: {
    tabs: [
      {
        name: '未收款订单',
        id: 0 as number,
        orders: [] as SaleOrder[]
      },
      {
        name: '已收款订单',
        id: 1 as number,
        orders: [] as SaleOrder[]
      },
      {
        name: '已完成订单',
        id: 2 as number,
        orders: [] as SaleOrder[]
      }
    ],
    currentTab: 0 as number,
    currentOrder: {} as SaleOrder,
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
    if (!app.userInfoReadyCallback) {
      app.userInfoReadyCallback = async () => {
        const orderResult: any = await getAllSaleOrders()
        this.initialOrders(orderResult.data)
      }
    }
    else {
      const orderResult: any = await getAllSaleOrders()
      this.initialOrders(orderResult.data)
    }
  },
  initialOrders(orders: SaleOrder[]) {
    const tabs = this.data.tabs
    orders.forEach((order: SaleOrder) => {
      order.createdAt = parseTime(new Date(order.createdAt))
      order.totalPrice = order.subOrders.reduce((sum: number, subOrder: any) => sum + subOrder.orderProducts ? subOrder.orderProducts.reduce((subSum: number, product: OrderProduct) => subSum + (product.price as number) * product.quantity, 0) : 0, 0).toFixed(2)
      if (order.status === Status.UNPAID) {
        tabs[0].orders.push(order)
      } else if (order.status === Status.PAID) {
        tabs[1].orders.push(order)
      } else if ((order.status === Status.COMPLETE)) {
        tabs[2].orders.push(order)
      }
    })
    this.setData({
      tabs: tabs
    })
  },
  switchTab(e: any) {
    this.setData({
      currentTab: e.detail.current,
    })
  },
  bindToDetail(e: any) {
    app.globalData.queryParameter.push(e.currentTarget.dataset.order)
    wx.navigateTo({
      url: './orderDetail/orderDetail',
    })
  },
  toChangeTab: function (e: any) {
    this.setData({
      currentTab: parseInt(e.currentTarget.dataset.tab),
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
      content: '您确认标记付款？',
      async success(res) {
        if (res.confirm) {
          let order = e.currentTarget.dataset.order
          const result: any = await markPaid([order])
          if (result.status === Status.SUCCESS) {
            wx.showToast({
              title: '标记成功',
            })
            const updateUnpaidOrders = that.data.tabs[0].orders.filter(currentOrder => currentOrder.orderId !== order.orderId)
            const updatePaidOrders = that.data.tabs[1].orders
            order.status = Status.PAID
            updatePaidOrders.unshift(order)
            that.setData({
              ['tabs[0].orders']: updateUnpaidOrders,
              ['tabs[1].orders']: updatePaidOrders,
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
    const updateOrders: SaleOrder[] | undefined = this.data.tabs[0].orders
    updateOrders.forEach((updateOrder: SaleOrder) => {
      if (updateOrder.orderId === currentOrder.orderId) {
        updateOrder.comment = input
        updateOrder.newComment = input
      }
    })
    this.setData({
      'tabs[0].orders': updateOrders,
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