// pages/checkOut/imageUploader/imageUploader.ts
import { uploadPhotoFront, uploadPhotoBack } from '../../../services/api/api'

Page({

  /**
   * Page initial data
   */
  data: {
    imageFront: [],
    imageBack: [],
    showOverlay: false,
    agreement: `身份证照片上传功能条款与隐私声明

    欢迎使用我们的手机应用！我们致力于为您提供安全、便捷的服务。在您使用身份证照片上传功能之前，请详细阅读以下声明：
    
    信息收集与使用：
    
    我们将仅收集并使用您提供的身份证照片信息来执行特定的服务，例如身份验证。我们不会在未经您明确同意的情况下使用此信息。
    您上传的照片信息将用于识别和验证您的身份，以确保您能够正常使用我们的应用。
    信息存储与安全：
    
    我们将采取合理的措施来保护您上传的照片信息，包括但不限于加密、安全传输协议等。
    您的照片信息将存储在安全的服务器上，只有授权人员能够访问。我们将不定期进行安全审查以确保信息的安全性。
    信息共享：
    
    我们将绝不私自分享、出售或出租您的照片信息给第三方，除非得到您的明确同意或法律要求。
    为了提供服务，我们可能与经过严格筛选并与我们签订保密协议的合作伙伴共享信息。
    隐私权设置：
    
    我们提供隐私设置选项，您可以根据自己的需要控制照片信息的可见性。请在应用设置中查找并调整这些选项。
    隐私权政策更新：
    
    我们保留在必要时更新隐私权政策的权利。任何变更都将在我们的应用中进行通知，并在更新后立即生效。
    法律遵从：
    
    我们将遵守所有适用的法律和法规，以保护您的隐私权。
    请注意，您使用身份证照片上传功能即表示您同意并接受这些条款与隐私声明。如果您有任何问题或疑虑，请随时联系我们的客户服务团队。
    
    感谢您信任我们，我们将努力保护您的个人信息！
    
    微帮微团队`
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad() {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },
  afterRead(event) {
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    file && this.setData({
      imageFront: [file]
    })
  },
  afterReadBack(event) {
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    file && this.setData({
      imageBack: [file]
    })
  },
  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },
  onFrontDelete() {
    this.setData({
      imageFront: []
    })
  },
  onBackDelete() {
    this.setData({
      imageBack: []
    })
  },
  onShowOverlay() {
    this.setData({
      showOverlay: true
    })
  },
  onClickHide() {
    this.setData({ show: false });
  },
  noop() { },
  async onUpload() {
    this.setData({
      showOverlay: false
    })
    await wx.showLoading({ title: 'Uploading' })
    const todoFront = uploadPhotoFront(this.data.imageFront[0].url)
    const todoBack = uploadPhotoBack(this.data.imageBack[0].url)
    try {
      await Promise.all([todoFront, todoBack])
      await wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 1000
      })
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      prevPage.setData({
        hasId: true
      })
      wx.navigateBack()
    } catch (err) {
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  }
})