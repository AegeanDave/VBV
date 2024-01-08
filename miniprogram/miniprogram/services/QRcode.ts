import { getQRcode } from './api/api'

export const generateQRcode = (serialId: number) => {
  return new Promise((resolve, reject) => {
    getQRcode(serialId).then((res: any) => {
      const { data: { data } } = res
      let src = "data:image/png;base64," + wx.arrayBufferToBase64(data)
      resolve(src)
    }).catch((err)=>{
      reject(err)
    })
  })
}

