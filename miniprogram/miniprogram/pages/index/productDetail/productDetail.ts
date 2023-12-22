import { Product, IAppOption } from "../../../models/index"
import { Status, Mode } from "../../../constant/index"
import { publishToStore, updatePriceForChild, getProduct } from "../../../services/api/api"

const app = getApp<IAppOption>()

Page({
  data: {
    product: {} as Product,
    slider: [] as string[],
    quantity: 1 as number,
    newPrice: 0,
    mode: Mode.NORMAL,
    showPopup: false,
    showToast: false,
    cartBadgeValue: 0,
    disbledSale: false,
  },
  async onLoad(options) {
    const product = await getProduct(options.id)
    wx.setNavigationBarTitle({
      title: product.name
    })
    this.setData({
      product: product,
      slider: product.images,
      mode: options.mode,
      newPrice: product?.defaultPrice || 0
    })
  },
  bindtoCart() {
    wx.switchTab({
      url: '../../shoppingCart/shoppingCart'
    })
  },
  reduce: function () {
    this.setData({
      quantity: this.data.quantity - 1
    })
  },
  bindKeyblur: function (e: any) {
    if (e.detail.value) {
      this.setData({
        quantity: parseInt(e.detail.value)
      })
    }
    else {
      this.setData({
        quantity: 1
      })
    }
  },
  plus: function () {
    this.setData({
      quantity: this.data.quantity + 1
    })
  },
  submitToCart: function () {
    const cartItem = { item: this.data.product, quantity: this.data.quantity }
    let cartStorage = wx.getStorageSync("cart")
    let cartLength = 0
    if (cartStorage && cartStorage.length >= 0) {
      const index = cartStorage.findIndex(item =>
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

  onDialogAction(e) {
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
      const result: any = await publishToStore(product, this.data.newPrice)
      if (result.status === Status.SUCCESS) {
        await wx.showToast({
          title: '成功上架',
          icon: 'success',
          duration: 2000
        })
        app.globalData.reload = true
        wx.navigateBack({
          delta: 1
        })
      }
      else {
        wx.showToast({
          title: result.message,
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
  },
  // async submitToSale(e: any) {
  //   this.setData({
  //     disbledSale: true
  //   })
  //   if (!isNaN(e.detail.value.newPrice) && e.detail.value.newPrice) {
  //     let newProduct = this.data.product
  //     if (newProduct.mySale) {
  //       newProduct.mySale.newPrice = e.detail.value.newPrice
  //     } else {
  //       newProduct.mySale = { newPrice: e.detail.value.newPrice }
  //     }
  //     const result: any = await updateSale(newProduct)
  //     this.setData({
  //       showPopup: false
  //     })
  //     if (result.status === Status.SUCCESS) {
  //       this.setData({
  //         showToast: true,
  //         ['product.mySale.inStoreProductId']: result.data.inStoreProductId,
  //         ['product.mySale.status']: Status.ENABLED
  //       })
  //       app.globalData.reload = true
  //     }
  //     else {
  //       wx.showToast({
  //         title: '修改失败',
  //         icon: 'none',
  //         duration: 2000
  //       })
  //     }
  //   }
  //   else {
  //     wx.showToast({
  //       title: '输入有误',
  //       icon: 'none',
  //       duration: 2000
  //     })
  //   }
  //   this.setData({
  //     disbledSale: false
  //   })
  // },
})