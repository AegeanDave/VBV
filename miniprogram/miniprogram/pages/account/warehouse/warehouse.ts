import { getWarehouse } from '../../../services/api/api'
import { Status } from "../../../constant/index"

Page({
  data: {
    activeTab: 0,
    showActionsheet: false,
    warehouse: null,
    groups: [
      { text: '更改电话号码' },
    ],
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad() {
    const { warehouse, order }: any = await getWarehouse()
    this.setData({
      warehouse: warehouse,
      activeProducts: warehouse.products.filter(product => product.status === "Active"),
      inactiveProducts: warehouse.products.filter(product => product.status === "Inactive"),
      order: order,
      processingOrderNum: order?.length || 0
    })
  },
  onShow: function () {

  },

  toSetting() {
    wx.navigateTo({
      url: './setting/setting?phone=' + this.data.warehouse.loginPhoneNumber
    })
  },
  openSheet() {
    this.setData({
      showActionsheet: true
    })
  },
  close: function () {
    this.setData({
      showActionsheet: false
    })
  },
})