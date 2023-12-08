import { createWarehouse, getWarehouse } from '../../../api/api'
import { WarehouseOrder } from '../../../models/index'
import { Status } from "../../../constant/index"

Page({
  data: {
    mode: undefined,
    showActionsheet: false,
    warehouse: undefined,
    phone: undefined,
    pendingCount: 0,
    shippingCount: 0,
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
  onShow: async function () {
    const warehouse: any = await getWarehouse()
    wx.setNavigationBarTitle({
      title: warehouse.status === Status.REGISTERED ? '仓库管理' : '仓库申请'
    })
    this.setData({
      mode: warehouse.status
    })
    if (warehouse.data) {
      let shippingCount = 0
      let pendingCount = 0
      warehouse.data.order.forEach((order: WarehouseOrder) => {
        if (order.trackingStatus === Status.PENDING) {
          pendingCount++
        }
        else if (order.trackingStatus === Status.SHIPPING) {
          shippingCount++
        }
      });
      this.setData({
        warehouse: warehouse.data.warehouse,
        shippingCount: shippingCount,
        pendingCount: pendingCount
      })
    }
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
  submitRegistration: async function (e: any) {
    const value = e.detail.value
    this.setData({
      showPopup: false
    })
    wx.showLoading({
      title: '正在提交',
    })
    const result = await createWarehouse(value.phone, this.data.countryCodes[value.countryIndex].id)
    wx.hideLoading()
    if (result.status === Status.SUCCESS) {
      wx.redirectTo({
        url: './mailer/mailer?phone=' + e.detail.value.phone
      })
    } else {
      wx.showToast({
        title: '手机号有误',
        duration: 2000,
        icon: 'none',
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
    const countryCodeValue = this.data.warehouse.loginPhoneNumberCountryCode
    wx.navigateTo({
      url: './setting/setting?phone=' + countryCodeValue + ' ' + this.data.warehouse.loginPhoneNumber
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