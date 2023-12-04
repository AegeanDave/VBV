import { Product, IAppOption } from "../../../models/index"
import { getProductInfoBySerialID, updateUserInfo, makeConnectionWithoutCode, updateSale } from '../../../api/api'
import { Status } from "../../../constant/index"

const app = getApp<IAppOption>()

Page({
  data: {
    product: {} as Product,
    alias: false as boolean,
    slider: [] as string[],
    quantity: 1 as number,
    showPopup: false as boolean,
    showAuthPopup: false as boolean,
    showToast: false as boolean,
    disbledSale: false,
  },
  onLoad(options) {
    if (!options.scene) {
      wx.showToast({
        title: '二维码有误',
        icon: 'none'
      })
    }
    else {
      const serialID = decodeURIComponent(options.scene)
      getProductInfoBySerialID(Number(serialID)).then((res: any) => {
        if (res.status === Status.FAIL) {
          wx.showToast({
            title: '产品有误'
          })
        }
        else {
          this.setData({
            product: res.data.product,
            slider: res.data.product.images,
            alias: res.data.alias
          })
        }
      })
    }
  },
  checkAuth() {
    if (app.globalData.userInfo) {
      this.setData({
        showPopup: !this.data.showPopup
      })
    }
  },
  bindGetUserInfo: function (e: any) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      updateUserInfo(app.globalData.userInfo as WechatMiniprogram.UserInfo)
      this.setData({
        showAuthPopup: true
      })
    }
    else {
      wx.showToast({
        title: '需要授权',
        icon: 'none',
        duration: 2000
      })
    }
  },
  async handleConnect() {
    const connectionResult: any = await makeConnectionWithoutCode(this.data.product.dealerSale.openId)
    if (connectionResult.status !== Status.FAIL) {
      wx.showToast({
        title: '关注成功'
      })
      this.setData({
        alias: true
      })
    } else {
      wx.showToast({
        title: '关注失败',
        icon: 'none'
      })
    }
    this.setData({
      showAuthPopup: false
    })
  },
  async submitToSale(e: any) {
    this.setData({
      disbledSale: true
    })
    if (!isNaN(e.detail.value.price) && e.detail.value.price) {
      let newProduct = this.data.product
      if (newProduct.mySale) {
        newProduct.mySale.newPrice = e.detail.value.price
      } else {
        newProduct.mySale = { newPrice: e.detail.value.price }
      }
      const result: any = await updateSale(newProduct)
      this.setData({
        showPopup: false
      })
      if (result.status === Status.SUCCESS) {
        this.setData({
          showToast: true,
          ['product.mySale.inStoreProductId']: result.data.inStoreProductId,
          ['product.mySale.status']: Status.ENABLED
        })
        app.globalData.reload = true
      }
      else {
        wx.showToast({
          title: '修改失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
    else {
      wx.showToast({
        title: '输入有误',
        icon: 'none',
        duration: 2000
      })
    }
    this.setData({
      disbledSale: false
    })
  },
  submitToCart: function () {
    const order = this.data.product
    order.quantity = this.data.quantity
    const localStorage = wx.getStorageSync("cart")
    let storage
    if (localStorage) {
      let sameSaleProduct = false
      storage = localStorage
      storage.forEach((product: Product) => {
        if (product.dealerSale.inStoreProductId === order.dealerSale.inStoreProductId) {
          product.quantity += order.quantity
          sameSaleProduct = true
        }
      })
      if (!sameSaleProduct) {
        storage.push(order)
      }
    }
    else {
      storage = []
      storage.push(order)
    }
    wx.setStorageSync("cart", storage)
    if (wx.getStorageSync('cart') && wx.getStorageSync('cart').length > 0) {
      this.setData({
        cartBadgeValue: wx.getStorageSync('cart').length
      })
    }
    wx.showToast({
      title: '添加成功',
    })
  },
  submitToPurchase: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE', 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc']
    })
    const product = this.data.product
    product.quantity = this.data.quantity
    app.globalData.queryParameter.push([product])
    wx.navigateTo({
      url: '../../checkOut/checkOut'
    })
  },
})

