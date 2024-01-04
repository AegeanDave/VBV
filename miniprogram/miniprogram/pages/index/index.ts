import { IAppOption } from "../../models/index"
import { Mode, Tabs } from "../../constant/index"
import { getProductList } from '../../services/api/api'

const app = getApp<IAppOption>()

Page({
  data: {
    productList: null,
    dealers: [],
    searching: false,
    selectedDealer: ''
  },
  async onLoad() {
    if (!app.globalData.user) {
      app.userInfoReadyCallback = async () => {
        const { products, alias }: any = await getProductList()
        this.setData({
          productList: products || [],
          dealers: alias,
        })
      }
      return
    }
    const { products, alias }: any = await getProductList()
    this.setData({
      productList: products || [],
      dealers: alias,
    })
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
    if (app.globalData.reload) {
      const { products, alias }: any = await getProductList()
      this.setData({
        productList: products || [],
        dealers: alias,
      })
      app.globalData.reload = false
    }
  },
  onSearch(e: any) {
    if (e.detail.value) {
      const newDealerList = this.data.dealers.map((dealer: any) => ({
        ...dealer, picking: dealer.dealer.username.toLowerCase().includes(e.detail.value)
      }))
      this.setData({
        dealers: newDealerList,
        searching: true
      })
    }
    else {
      this.setData({
        searching: false
      })
    }
  },
  onPickDealer: function (e: any) {
    const { dealer } = e.currentTarget.dataset
    if (dealer === 'all') {
      this.setData({
        selectedDealer: ''
      })
      return
    }
    this.setData({
      selectedDealer: dealer
    })
  },
  onClear() {
    this.setData({
      searching: false,
    })
  },
  viewDetail: function (e: any) {
    wx.navigateTo({
      url: `./productDetail/productDetail?mode=${Mode.NORMAL}&id=${e.currentTarget.dataset.product.id}`,
    })
  },
  onToConnection: function () {
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
