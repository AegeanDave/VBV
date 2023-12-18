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
    const order = this.data.product
    const quantity = this.data.quantity
    order.quantity = quantity
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
    let that = this
    wx.requestSubscribeMessage({
      tmplIds: ['GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE', 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc'],
      complete() {
        const product = that.data.product
        product.quantity = that.data.quantity
        app.globalData.queryParameter.push([product])
        wx.navigateTo({
          url: '../../checkOut/checkOut'
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
  // updatePriceForChild: async function () {
  //   const price = this.data.newPrice
  //   if (!isNaN(price)) {
  //     const result: any = await updatePriceForChild(price, this.data.product.saleChild, this.data.product.dealerSale.inStoreProductId)
  //     if (result.status === Status.SUCCESS) {
  //       wx.showToast({
  //         title: '更新成功',
  //         icon: 'success',
  //         duration: 2000
  //       })
  //       setTimeout(function () {
  //         wx.navigateBack({
  //           delta: 1
  //         })
  //       }, 1000)
  //     }
  //     else {
  //       wx.showToast({
  //         title: '更新失败',
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
  // },
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
        wx.showToast({
          title: '成功上架',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          app.globalData.reload = true
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
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
  toStore() {
    wx.redirectTo({
      url: '../../account/store/store'
    })
    this.setData({
      showPopup: false
    })
  },
  async submitToSale(e: any) {
    this.setData({
      disbledSale: true
    })
    if (!isNaN(e.detail.value.newPrice) && e.detail.value.newPrice) {
      let newProduct = this.data.product
      if (newProduct.mySale) {
        newProduct.mySale.newPrice = e.detail.value.newPrice
      } else {
        newProduct.mySale = { newPrice: e.detail.value.newPrice }
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
})