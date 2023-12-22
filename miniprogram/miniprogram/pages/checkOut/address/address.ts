import { Address, IAppOption } from "../../../models/index"
import { deleteAddress, getAddresses } from '../../../services/api/api'
const app = getApp<IAppOption>()

Page({
  data: {
    currentAddress: 0 as number,
    addressList: [] as Address[],
  },
  async onLoad() {
    const { addresses }: any = await getAddresses()
    this.setData({
      addressList: addresses
    })

  },
  addNewAddress: function () {
    wx.navigateTo({
      url: '../newAddress/newAddress'
    })
  },
  onChoose: function (e) {
    const address = e.currentTarget.dataset.address
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    prevPage.setData({
      selectedAddress: address
    })
    wx.navigateBack({
      delta: 1
    })
  },
  onDelete: async function (e: any) {
    const id = e.currentTarget.dataset.address.id
    const result = await deleteAddress(id)
    if (result.status === 'SUCCESS') {
      this.setData({
        addressList: this.data.addressList.filter(address => address.id !== id),
      })
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      })
    }
  },
})