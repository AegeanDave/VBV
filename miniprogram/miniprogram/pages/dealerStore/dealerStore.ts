import { getDealerStores, publishToStore } from "../../services/api/api"
import { Status, Mode } from "../../constant/index"

Page({

  /**
   * Page initial data
   */
  data: {
    dealers: null,
    dealerProducts: null,
    selectedProduct: null,
    sheetShow: false,
    newPrice: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad() {
    try {
      const { dealers, dealerProducts }: any = await getDealerStores()
      this.setData({
        dealers: dealers,
        dealerProducts: dealerProducts
      })
    } catch (err) {
      console.log(err)
    }
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },
  handleOpenSheet(e: any) {
    this.setData({
      sheetShow: true,
      selectedProduct: e.currentTarget.dataset.product,
      newPrice: e.currentTarget.dataset.product.defaultPrice
    })
  },
  onSheetClose() {
    this.setData({
      sheetShow: false,
    })
  },
  onPriceChange(e: any) {
    this.setData({
      newPrice: e.detail
    })
  },
  onPriceDrug(e: any) {
    this.setData({
      newPrice: e.detail.value,
    });
  },
  handleNavProductDetail: function () {
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PUBLISHING}&id=${this.data.selectedProduct.id}`,
    })
  },
  handleAddToStore: async function () {
    if (!isNaN(this.data.newPrice) && this.data.newPrice) {
      let product = this.data.selectedProduct
      const result: any = await publishToStore(product, this.data.newPrice)
      if (result === true) {
        wx.showToast({
          title: '此商品已在您的商店中',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (result.status === Status.SUCCESS) {
        await wx.showToast({
          title: '成功上架',
          icon: 'success',
          duration: 2000
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
})