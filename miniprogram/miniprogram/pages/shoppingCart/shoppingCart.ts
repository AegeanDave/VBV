import { Cart, IAppOption } from "../../models/index"
import { Tabs } from '../../constant/index'

const app = getApp<IAppOption>()

Page({
  data: {
    products: [] as Cart[],
    totalPrice: 0
  },
  onLoad() {
  },
  onShow() {
    const cartItems = wx.getStorageSync('cart')
    const totalPrice = (cartItems || []).reduce((sum: number, product: Cart) => {
      if (!product?.disabled) {
        const { item: { defaultPrice, specialPrice }, quantity } = product
        return sum + Number(quantity * (specialPrice[0]?.price.price || defaultPrice))
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
  onQuantityChange: function (e: any) {
    const currIndex = e.currentTarget.dataset.index
    wx.setStorageSync("cart", this.data.products.map((item, index) => {
      if (index === currIndex) {
        return { ...item, quantity: e.detail }
      }
      return item
    }))
    this.onShow()
  },
  submitOrder: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['0_8ksH5gYQCdSYmrZDoO5Mep1zifl_dF8pOis7TZ-uI'],
      complete() {
        wx.navigateTo({
          url: `../checkOut/checkOut?mode=CART`
        })
      }
    })
  },
})