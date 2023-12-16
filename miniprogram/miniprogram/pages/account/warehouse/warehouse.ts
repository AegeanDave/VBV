import { createWarehouse, getWarehouse } from '../../../services/api/api'
import { Status } from "../../../constant/index"

Page({
  data: {
    showActionsheet: false,
    warehouse: {},
    phone: '',
    disabled: true,
    tab: '0',
    countryCodes: [{
      id: 'CN',
      name: '中国',
      value: '86'
    }, {
      id: 'CA',
      name: '加拿大',
      value: '1'
    }, {
      id: 'US',
      name: '美国',
      value: '1'
    }],
    groups: [
      { text: '更改电话号码' },
    ],
    currentCode: 0,
    showPopup: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad() {
    const { warehouse, order }: any = await getWarehouse()
    wx.setNavigationBarTitle({
      title: warehouse?.status === 'Active' ? '仓库管理' : '仓库申请'
    })
    this.setData({
      warehouse: warehouse,
      order: order,
      processingOrderNum: order?.length || 0
    })
  },
  onShow: function () {


  },
  handleValidation: function (e: any) {
    if (e.detail.value && e.detail.value.length >= 10) {
      this.setData({
        disabled: false
      })
    }
    else {
      this.setData({
        disabled: true
      })
    }
    this.setData({
      phone: e.detail.value
    })
  },
  handleChangeTab: function (e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({
      tab: index
    })
  },
  async onDialogTap(e) {
    const { detail: { index } } = e
    if (index === 1) {
      const result = await createWarehouse(this.data.phone, this.data.countryCodes[this.data.currentCode].value)
      this.setData({
        showPopup: false
      })
      if (result?.status === 'FAIL') {
        wx.showToast({
          title: '创建失败',
          icon: 'error',
          duration: 2000
        })
      }
    }
    else {
      this.setData({
        showPopup: false
      })
    }
  },
  toConfirm() {
    this.setData({
      showPopup: true
    })
  },
  bindPickerChange: function (e: any) {
    this.setData({
      currentCode: e.detail.value
    })
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
  btnClick(e: any) {
    this.toSetting()
    this.close()
  }
})