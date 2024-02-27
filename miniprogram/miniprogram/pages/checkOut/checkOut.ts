import { Product, IAppOption } from "../../models/index"
import { Status } from "../../constant/index"
import Dialog from '@vant/weapp/dialog/dialog'
import { getAddresses, submitOrder } from '../../services/api/api'
const app = getApp<IAppOption>()

Page({
  data: {
    order: [] as Product[],
    selectedAddress: null,
    comment: '',
    isEditing: false,
    addressList: [],
    totalPrice: 0,
    agreeUsingId: false,
    hasId: false,
    mode: null
  },
  async onLoad(option: any) {
    const { addresses, hasId }: any = await getAddresses()

    let items
    if (option.mode === 'CART') {
      items = wx.getStorageSync('cart')
    }
    if (option.mode === 'QuickBuy') {
      items = wx.getStorageSync('quickBuy')
    }
    const totalPrice = items.reduce((sum: number, product: any) => sum + Number(product.quantity * product.item.defaultPrice), 0).toFixed(2)
    this.setData({
      order: items,
      totalPrice: totalPrice,
      addressList: addresses || [],
      selectedAddress: addresses ? addresses[0] : null,
      hasId: hasId,
      mode: option.mode
    })
    const needId = this.data.order.some((element: any) => element.item.product.setting?.isIdRequired)
    if (needId) {
      if (hasId && !this.data.agreeUsingId) {
        Dialog.confirm({
          title: '身份信息',
          message: '订单含海外直邮，需要授权以获取身份证照片',
        }).then(() => {
          this.setData({
            agreeUsingId: true
          })
        }).catch(() => {
          wx.navigateBack()
        })
      } if (!hasId) {
        Dialog.confirm({
          title: '身份信息',
          message: '订单含海外直邮，需要您上传身份证照片',
        })
          .then(() =>
            wx.navigateTo({ url: './imageUploader/imageUploader' })
          ).catch(() => {
            wx.navigateBack()
          })
      }
    }
  },
  onShow() {
    const needId = this.data.order.some((element: any) => element.item.product.setting?.isIdRequired)
    const hasId = this.data.hasId
    if (needId) {
      if (hasId && !this.data.agreeUsingId) {
        Dialog.confirm({
          title: '身份信息',
          message: '订单含海外直邮，需要授权以获取身份证照片',
        }).then(() => {
          this.setData({
            agreeUsingId: true
          })
        }).catch(() => {
          wx.navigateBack()
        })
      } if (!hasId) {
        Dialog.confirm({
          title: '身份信息',
          message: '订单含海外直邮，需要您上传身份证照片',
        })
          .then(() =>
            wx.navigateTo({ url: './imageUploader/imageUploader' })
          ).catch(() => {
            wx.navigateBack()
          })
      }
    }
  },
  toEditing() {
    this.setData({
      isEditing: true
    })
  },
  toAddFile: function () {
    wx.navigateTo({
      url: './newAddress/uploadFile/uploadFile'
    })
  },
  toManageAddress: function (e: any) {
    if (e.currentTarget.dataset.address) {
      wx.navigateTo({
        url: `../address/address?selectedId=${e.currentTarget.dataset.address.id}`
      })
    } else {
      wx.navigateTo({
        url: `../address/address`
      })
    }
  },
  handleChangeComment(e: any) {
    const comment = e.detail.value
    this.setData({
      comment: comment,
      isEditing: false
    })
  },
  pay: async function () {
    this.setData({
      disabled: true
    })
    const order: Product[] = this.data.order
    const addressId = this.data.selectedAddress.id
    const result: any = await submitOrder(order, addressId, this.data.comment)
    if (result.status === Status.FAIL) {
      await wx.showToast({
        title: '下单失败',
        icon: 'error'
      })
    } else {
      this.data.mode === 'QuickBuy' ? wx.removeStorageSync('quickBuy') : wx.removeStorageSync('cart')
      wx.redirectTo({
        url: `./contactToPay/contactToPay?orderNumber=${result.orderNumber}`,
      });
    }
  }
})