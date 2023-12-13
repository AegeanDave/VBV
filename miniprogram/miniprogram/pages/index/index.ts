import { Product, IAppOption } from "../../models/index"
import { Mode, Tabs } from "../../constant/index"
import { getProductList } from '../../services/api/api'

const app = getApp<IAppOption>()

Page({
  data: {
    productList: undefined,
    searchList: [] as Product[],
    inputSearch: '',
    selectedDealer: '',
    dealers: undefined,
  },
  onLoad() {
    app.userInfoReadyCallback = async () => {
      const { products, alias }: any = await getProductList()
      this.setData({
        productList: products,
        searchList: products,
        dealers: alias,
      })
    }
  },
  onPullDownRefresh: async function () {
    wx.showNavigationBarLoading()
    const { products, alias }: any = await getProductList()
    this.setData({
      productList: products,
      dealers: alias
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
    }, 1000)
  },
  onShow: async function () {
    if (wx.getStorageSync('cart') && wx.getStorageSync('cart').length > 0) {
      wx.setTabBarBadge({
        index: Tabs.CART,
        text: wx.getStorageSync('cart').length.toString()
      })
    }
    else {
      wx.removeTabBarBadge({
        index: Tabs.CART
      })
    }
  },
  handleProductsSearching: function (e: any) {
    const value: string = e.detail.value
    const searchRange: Product[] = this.data.productList
    let searchResult
    if (value) {
      if (this.data.selectedDealer) {
        searchResult = searchRange.filter((product: Product) => {
          return product.productName.includes(value) && product.dealerSale.name === this.data.selectedDealer
        })
      }
      else {
        searchResult = searchRange.filter((product: Product) => {
          return product.productName.includes(value)
        })
      }
    }
    else {
      if (this.data.selectedDealer) {
        searchResult = searchRange.filter((product: Product) => {
          return product.dealerSale.name === this.data.selectedDealer
        })
      }
      else {
        searchResult = this.data.productList
      }
    }
    this.setData({
      inputSearch: value,
      searchList: searchResult
    })
  },
  chooseDealer: function (e: any) {
    const dealer = e.currentTarget.dataset.dealer
    const searchRange: Product[] = this.data.productList
    let searchResult
    if (dealer) {
      if (this.data.inputSearch) {
        searchResult =
          searchRange.filter((product: Product) =>
            product.dealerSale.name === dealer && product.productName.includes(this.data.inputSearch)
          )
      }
      else {
        searchResult =
          searchRange.filter((product: Product) =>
            product.dealerSale.name === dealer
          )
      }
    }
    else {
      if (this.data.inputSearch) {
        searchResult =
          searchRange.filter((product: Product) => {
            return product.productName.includes(this.data.inputSearch)
          })
      }
      else {
        searchResult = this.data.productList
      }
    }
    this.setData({
      searchList: searchResult,
      selectedDealer: dealer,
    })
  },
  viewDetail: function (e: any) {
    app.globalData.queryParameter.push(e.currentTarget.dataset.product)
    wx.navigateTo({
      url: './productDetail/productDetail?mode=' + Mode.NORMAL,
    })
  },
  onConnectAlias: function () {
    if (app.globalData.user?.status === 'Not_Verified') {
      wx.navigateTo({
        url: '/pages/register/register',
      })
    }
    wx.navigateTo({
      url: '/pages/account/inputCode/inputCode',
    })
  }
})
