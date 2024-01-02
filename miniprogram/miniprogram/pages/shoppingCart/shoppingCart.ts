import { Product, IAppOption } from "../../models/index"
import { Tabs } from '../../constant/index'

const app = getApp<IAppOption>()

Page({
  data: {
    products: [] as Product[],
    totalPrice: 0
  },
  onLoad() {
  },
  onShow() {
    const cartItems = wx.getStorageSync('cart')
    const totalPrice = (cartItems || []).reduce((sum: number, product: Product) => {
      if (!product?.disabled) {
        return sum + Number(product.quantity * product.item.defaultPrice)
      }
      return sum + 0
    }, 0)
    this.setData({
      products: cartItems || [],
      totalPrice: totalPrice?.toFixed(2) || 0
    })
    if (cartItems?.length > 0) {
      wx.setTabBarBadge({
        index: Tabs.CART,
        text: wx.getStorageSync('cart').length
      })
    }
    else {
      wx.removeTabBarBadge({
        index: Tabs.CART
      })
    }
  },
  onDelete: function (e: any) {
    const originOrder = this.data.products
    const newOrder = originOrder.filter((value: any, index: number) => {
      if (index !== e.currentTarget.dataset.index) {
        return value
      }
    })
    wx.showToast({
      title: '已移出购物车',
      icon: 'success',
      duration: 2000
    })
    wx.setStorageSync("cart", newOrder)
    this.onShow()
  },
  reduce: function (e: any) {
    const index: number = e.currentTarget.dataset.index
    let order: Product[] = this.data.products
    order[index].quantity--
    wx.setStorageSync("cart", order)
    this.onShow()
  },
  bindKeyblur: function (e: any) {
    const index: number = e.currentTarget.dataset.index
    let order: Product[] = this.data.products
    if (!e.detail.value) {
      this.onShow()
    }
    else {
      order[index].quantity = parseInt(e.detail.value)
      wx.setStorageSync("cart", order)
      this.onShow()
    }
  },
  plus: function (e: any) {
    const index: number = e.currentTarget.dataset.index
    let order: Product[] = this.data.products
    order[index].quantity++
    wx.setStorageSync("cart", order)
    this.onShow()
  },
  submitOrder: function () {
    let that = this
    wx.requestSubscribeMessage({
      tmplIds: ['GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE', 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc'],
      complete() {
        wx.navigateTo({
          url: `../checkOut/checkOut?mode=CART`
        })
      }
    })
  },
})