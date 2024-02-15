import { getMyStore, publishProduct, unpublishProduct, updatePrice, deleteProduct, generatePoster } from "../../services/api/api"
import { IAppOption } from "../../models/index"
import { Status, Mode } from "../../constant/index"

const app = getApp<IAppOption>()
Page({
  /**
   * Page initial data
   */
  data: {
    dropdownValue: 0,
    dropdownOptions: [
      { text: '全部商品', value: 0 },
      { text: '转售商品', value: 1 },
      { text: '自营商品', value: 2 },
    ],
    isFiltered: false,
    storeProducts: null,
    dealerProducts: null,
    selectedProduct: null,
    sheetShow: false,
    newPrice: 0,

    posterSheetShow: false,
    posterUrl: null
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad() {
    const { myProducts, availableProducts }: any = await getMyStore()
    this.setData({
      storeProducts: myProducts || [],
      dealerProducts: availableProducts || []
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },
  onDropdownSelect(e: any) {
    switch (e.detail) {
      case 0:
        this.handleFilter('ALL')
        break;
      case 1:
        this.handleFilter('DEALER')
        break;
      case 2:
        this.handleFilter('SELF')
        break;
      default:
        break;
    }
  },
  handleFilter(filterMode: 'SELF' | 'DEALER' | 'ALL') {
    if (filterMode === 'ALL') {
      this.setData({
        isFiltered: false,
        filterProduct: null
      })
      return
    }
    const username = app.globalData.user?.username
    if (filterMode === 'SELF') {
      this.setData({
        isFiltered: true,
        filterProduct: this.data.storeProducts.filter(item => item.dealer.username === username)
      })
    }
    if (filterMode === 'DEALER') {
      this.setData({
        isFiltered: true,
        filterProduct: this.data.storeProducts.filter(item => item.dealer.username !== username)
      })
    }
  },
  handleNavDealerStore() {
    wx.navigateTo({ url: '../dealerStore/dealerStore' })
  },
  handleNavConnection() {
    wx.navigateTo({ url: '../account/inputCode/inputCode' })
  },
  handleNavPreview: function () {
    this.onSheetClose()
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PREVIEW}&id=${this.data.selectedProduct?.id}`,
    })
  },
  handleNavProduct: function (e: any) {
    const { id } = e.currentTarget.dataset.product
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PUBLISHING}&id=${id}`,
    })
  },
  handlePublish: async function (e: any) {
    let product
    if (e.currentTarget.dataset.product) {
      product = e.currentTarget.dataset.product
    }
    product = this.data.selectedProduct
    const result: any = await publishProduct(product)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '成功上架',
        icon: 'success',
        duration: 2000
      })
      const newList = this.data.storeProducts?.map((item: any) => {
        if (product.id === item.id) {
          return { ...item, status: 'Active' }
        }
        return item
      })
      this.setData({
        storeProducts: newList,
        sheetShow: false
      })
      app.globalData.reload = true
    }
    else {
      wx.showToast({
        title: '操作有误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  handleUnpublish: async function (e: any) {
    let product
    if (e.currentTarget.dataset.product) {
      product = e.currentTarget.dataset.product
    }
    product = this.data.selectedProduct
    const result: any = await unpublishProduct(product)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '已下架',
        icon: 'success',
        duration: 2000
      })
      const newList = this.data.storeProducts?.map(item => {
        if (product.id === item.id) {
          return { ...item, status: 'Inactive' }
        }
        return item
      })
      this.setData({
        storeProducts: newList,
        sheetShow: false
      })
      app.globalData.reload = true
    }
    else {
      wx.showToast({
        title: '操作有误',
        icon: 'none',
        duration: 2000
      })
    }
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
  async handleUpdatePrice() {
    const selectedProduct = this.data.selectedProduct
    wx.showLoading({ title: '提交中' })
    try {
      await updatePrice(selectedProduct, this.data.newPrice)
      this.setData({
        storeProducts: this.data.storeProducts?.map((item: any) => {
          if (item.id === selectedProduct.id) {
            return { ...item, defaultPrice: this.data.newPrice }
          }
          return item
        })
      })
      wx.hideLoading()
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } catch (err) {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      })
    } finally {
      this.onSheetClose()
    }
  },
  async handleDelete(e: any) {
    let product
    if (e.currentTarget.dataset?.product) {
      product = e.currentTarget.dataset?.product
    } else {
      product = this.data.selectedProduct
    }
    const that = this
    wx.showModal({
      title: '提示',
      content: '确认删除产品',
      async success(res) {
        if (res.confirm) {
          try {
            await deleteProduct(product)
            that.setData({
              storeProducts: that.data.storeProducts.filter((item: any) => item.id !== product.id)
            })
            wx.showToast({ title: '成功删除' })
          } catch (err) {
            console.log(err)
            wx.showToast({ title: '成功失败', icon: 'none' })
          }
        }
      }
    })
  },
  handleShowPoster() {
    this.setData({
      posterSheetShow: true,
      sheetShow: false
    })
  },
  closeCanvas() {
    this.setData({
      showCanvasMask: false,
      posterUrl: null
    })
  },
  handleSavingImage() {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.posterUrl,
      success() {
        wx.showToast({
          title: '保存成功，从相册中分享给朋友吧',
          icon: 'none',
          duration: 3000,
        });
        wx.getFileSystemManager().unlink(that.data.posterUrl)
      },
      fail() {
        wx.showToast({
          title: '图片保存失败，请稍候重试',
          icon: 'none',
          duration: 3000,
        });
      },
      complete() {
        that.closeCanvas()
      }
    })
  },
  async formSubmit(e: any) {
    const { numOfImage, text } = e.detail.value
    this.setData({
      posterSheetShow: false,
      showCanvasMask: true
    })
    try {
      const todoPoster: any = await generatePoster(this.data.selectedProduct, text, numOfImage)
      const filePath: any = `${wx.env.USER_DATA_PATH}/poster_${this.data.selectedProduct.id}.png`
      wx.getFileSystemManager().writeFile({
        filePath, encoding: 'binary',
        data: todoPoster,
        success: () => {
          this.setData({ posterUrl: filePath })
        },
        fail: (err) => {
          console.log(err)
        }
      })
    } catch (err) {
      console.log(err)
    }
  },
  onPosterSheetClose() {
    this.setData({
      posterSheetShow: false
    })
  }
})