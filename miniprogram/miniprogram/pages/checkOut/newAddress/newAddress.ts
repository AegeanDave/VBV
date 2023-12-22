import { Address } from "../../../models/index"
import { Status, AddressField } from "../../../constant/index"
import { addAddress } from '../../../services/api/api'

Page({
  data: {
    name: '',
    phone: '',
    regionChina: ['北京市', '北京市', '东城区'],
    quickInputAddress: '',
    currentField: AddressField.NORMALFORM
  },
  bindRegionChange: function (e: any) {
    this.setData({
      regionChina: e.detail.value
    })
  },
  activateField(e: any) {
    this.setData({
      currentField: Number(e.currentTarget.dataset.index)
    })
  },
  handleChangeName(e: any) {
    this.setData({
      name: e.detail.value
    })
  },
  handleChangePhone(e: any) {
    this.setData({
      phone: e.detail.value
    })
  },
  handleChangeComment(e: any) {
    this.setData({
      quickInputAddress: e.detail.value
    })
  },
  formSubmit: async function (e: any) {
    let address: Address = {
      province: e.detail.value.region[0],
      city: e.detail.value.region[1],
      street: e.detail.value.region[2] + " " + e.detail.value.street,
      ...e.detail.value
    }
    const result: any = await addAddress(address, this.data.currentField)
    if (result.status && result.status === Status.FAIL) {
      wx.showToast({
        title: '添加失败',
        icon: 'none',
        duration: 2000
      })
    } else {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      prevPage.setData({
        addressList: [...prevPage.data.addressList, result]
      })
      await wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
      wx.navigateBack({
        delta: 1
      })
    }
  },
})