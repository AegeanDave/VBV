import { Product, Address, IAppOption } from "../../models/index"
import { Status } from "../../constant/index"
import { getAddress, submitOrder } from '../../services/api/api'
const app = getApp<IAppOption>()

Page({
  data: {
    order: [] as Product[],
    currentAddress: 0 as number,
    comment: '' as string,
    isEditing: false,
    addressList: [] as Address[],
    disabled: true,
    totalPrice: 0,
    needCredential: null as boolean,
    hasCredential: null as boolean,
  },
  async onLoad() {
    const order = app.globalData.queryParameter.pop()
    const findCredentialElement = order.find((element: Product) => element.idCardRequired)
    const totalPrice = order.reduce((sum: number, product: Product) => sum + product.quantity * (product.dealerSale.price as number), 0).toFixed(2)
    const addressList = await getAddress() as Address[]
    app.globalData.addressList = addressList
    app.globalData.currentAddress = 0
    const imagesExist: boolean = (addressList.length > 0 && (addressList[0].idFrontImage && addressList[0].idBackImage))?true:false
    this.setData({
      order: order,
      totalPrice: totalPrice,
      addressList: addressList,
      currentAddress: 0,
      needCredential: findCredentialElement ? true : false,
      hasCredential: imagesExist
    })
    if (findCredentialElement) {
      this.setData({
        disabled: imagesExist ? false : true
      })
    }
    else {
      this.setData({
        disabled: addressList[0] ? false : true
      })
    }
  },
  onShow() {
    if (app.globalData.addressList && app.globalData.addressList.length > 0) {
      const addressList = app.globalData.addressList
      const currentAddress = app.globalData.currentAddress
      const imagesExist: boolean = (addressList.length > 0 && addressList[currentAddress].idFrontImage && addressList[currentAddress].idBackImage) ? true : false
      this.setData({
        addressList: addressList,
        currentAddress: currentAddress,
        hasCredential: imagesExist,
      })
      if (this.data.needCredential) {
        this.setData({
          disabled: !imagesExist
        })
      }
      else {
        this.setData({
          disabled: addressList[currentAddress] ? false : true
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
  toManageAddress: function () {
    wx.navigateTo({
      url: './address/address'
    })
  },
  toNewAddress: function () {
    wx.navigateTo({
      url: './newAddress/newAddress'
    })
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
    const addressId = this.data.addressList[this.data.currentAddress].addressId
    const result: any = await submitOrder(order, addressId, this.data.comment)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '下单成功',
      })
      setTimeout(function () {
        wx.removeStorageSync('cart')
        app.globalData.queryParameter.push(order)
        wx.redirectTo({
          url: './contactToPay/contactToPay',
        });
      }, 500)
    } else {
      wx.showToast({
        title: '下单失败',
      })
      this.setData({
        disabled: false
      })
    }
  }
})