import { IAppOption } from "../../../models/index"
import { Status, Mode } from "../../../constant/index"
import { publishToStore, getProduct } from "../../../services/api/api"

const app = getApp<IAppOption>()

Page({
  data: {
    product: null,
    slider: [] as string[],
    quantity: 1 as number,
    newPrice: 0,
    mode: Mode.NORMAL,
    showPopup: false,
    showToast: false,
    cartBadgeValue: 0,
    disbledSale: false,
  },
  async onLoad(options: any) {
    const product = await getProduct(options.id)
    wx.setNavigationBarTitle({
      title: product.name
    })
    this.setData({
      product: product,
      slider: product.images,
      mode: options.mode,
      newPrice: product?.defaultPrice || 0,
      cartBadgeValue: wx.getStorageSync("cart")?.length
    })
  },
  bindtoCart() {
    wx.switchTab({
      url: '../../shoppingCart/shoppingCart'
    })
  },
  onQuantityChange: function (e: any) {
    this.setData({
      quantity: e.detail
    })
  },
  submitToCart: function () {
    const cartItem = { item: this.data.product, quantity: this.data.quantity }
    let cartStorage = wx.getStorageSync("cart")
    let cartLength = 0
    if (cartStorage && cartStorage.length >= 0) {
      const index = cartStorage.findIndex((item: any) =>
        item.item.id === cartItem.item.id
      )
      cartLength = cartStorage.length
      if (index !== -1) {
        cartStorage[index].quantity += cartItem.quantity
      }
      else {
        cartStorage.push(cartItem)
        cartLength += 1
      }
    } else {
      cartStorage = [cartItem]
      cartLength = 1
    }
    wx.setStorageSync("cart", cartStorage)
    this.setData({
      cartBadgeValue: cartLength
    })
    wx.showToast({
      title: '添加成功',
    })
  },
  submitToPurchase: function () {
    let that = this
    wx.requestSubscribeMessage({
      tmplIds: ['GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE', 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc'],
      complete() {
        wx.setStorageSync('quickBuy', [{ item: that.data.product, quantity: that.data.quantity }])
        wx.navigateTo({
          url: `../../checkOut/checkOut?mode=QuickBuy`
        })
      }
    })
  },
  bindUpdateValue: function (e: any) {
    this.setData({
      newPrice: e.detail.value
    })
  },
  onDialogOpen() {
    this.setData({
      showPopup: true
    })
  },
  onDialogAction(e: any) {
    if (e.detail.index === 1) {
      this.onAddToStore()
    }
    this.setData({
      showPopup: false
    })
  },
  onAddToStore: async function () {
    if (!isNaN(this.data.newPrice) && this.data.newPrice) {
      let product = this.data.product
      try {
        const result: any = await publishToStore(product, this.data.newPrice)
        if (result === true) {
          wx.showToast({
            title: '此商品已在您的商店中',
            icon: 'none',
            duration: 2000
          })
          return
        }
        await wx.showToast({
          title: '成功上架',
          icon: 'success',
          duration: 2000
        })
        app.globalData.reload = true
        wx.navigateBack({
          delta: 1
        })
      } catch (err) {
        wx.showToast({
          title: '上架失败',
          icon: 'error',
          duration: 2000
        })
      }
    }
  },
})