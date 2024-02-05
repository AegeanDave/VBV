import { getMyStore, publishProduct, unpublishProduct, updatePrice, deleteProduct } from "../../services/api/api"
import { IAppOption } from "../../models/index"
import { Status, Mode } from "../../constant/index"

const app = getApp<IAppOption>()
Page({
  /**
   * Page initial data
   */
  data: {
    dropdownValue: 0,
    dropdownOptions: [
      { text: '全部商品', value: 0 },
      { text: '转售商品', value: 1 },
      { text: '自营商品', value: 2 },
    ],
    isFiltered: false,
    storeProducts: null,
    dealerProducts: null,
    selectedProduct: null,
    sheetShow: false,
    newPrice: 0,

    // 设置区，针对部件的数据设置
    showCanvasMask: false,
    qrcodeDiam: 80,               // 小程序码直径
    infoSpace: 14,                // 底部信息的间距
    saveImageWidth: 500,          // 保存的图像宽度
    bottomInfoHeight: 100,        // 底部信息区高度
    tipsOne: "长按识别二维码",   // 提示语
    tipsTwo: "进入微帮微购好货",   // 提示语

    // 缓冲区，无需手动设定
    QRcode: null,
    canvasWidth: 0,               // 画布宽
    canvasHeight: 0,              // 画布高
    canvasDom: {} as Object,              // 画布dom对象
    canvas: null as any,                  // 画布的节点
    ctx: null as any,                    // 画布的上下文
    dpr: 1,                       // 设备的像素比
    posterHeight: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  async onLoad() {
    const { myProducts, availableProducts }: any = await getMyStore()
    this.setData({
      storeProducts: myProducts || [],
      dealerProducts: availableProducts || []
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },
  onDropdownSelect(e: any) {
    switch (e.detail) {
      case 0:
        this.handleFilter('ALL')
        break;
      case 1:
        this.handleFilter('DEALER')
        break;
      case 2:
        this.handleFilter('SELF')
        break;
      default:
        break;
    }
  },
  handleFilter(filterMode: 'SELF' | 'DEALER' | 'ALL') {
    if (filterMode === 'ALL') {
      this.setData({
        isFiltered: false,
        filterProduct: null
      })
      return
    }
    const username = app.globalData.user?.username
    if (filterMode === 'SELF') {
      this.setData({
        isFiltered: true,
        filterProduct: this.data.storeProducts.filter(item => item.dealer.username === username)
      })
    }
    if (filterMode === 'DEALER') {
      this.setData({
        isFiltered: true,
        filterProduct: this.data.storeProducts.filter(item => item.dealer.username !== username)
      })
    }
  },
  handleNavDealerStore() {
    wx.navigateTo({ url: '../dealerStore/dealerStore' })
  },
  handleNavConnection() {
    wx.navigateTo({ url: '../account/inputCode/inputCode' })
  },
  handleNavPreview: function () {
    this.onSheetClose()
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PREVIEW}&id=${this.data.selectedProduct?.id}`,
    })
  },
  handleNavProduct: function (e: any) {
    const { id } = e.currentTarget.dataset.product
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PUBLISHING}&id=${id}`,
    })
  },
  handlePublish: async function (e: any) {
    let product
    if (e.currentTarget.dataset.product) {
      product = e.currentTarget.dataset.product
    }
    product = this.data.selectedProduct
    const result: any = await publishProduct(product)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '成功上架',
        icon: 'success',
        duration: 2000
      })
      const newList = this.data.storeProducts?.map((item: any) => {
        if (product.id === item.id) {
          return { ...item, status: 'Active' }
        }
        return item
      })
      this.setData({
        storeProducts: newList,
        sheetShow: false
      })
      app.globalData.reload = true
    }
    else {
      wx.showToast({
        title: '操作有误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  handleUnpublish: async function (e: any) {
    let product
    if (e.currentTarget.dataset.product) {
      product = e.currentTarget.dataset.product
    }
    product = this.data.selectedProduct
    const result: any = await unpublishProduct(product)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '已下架',
        icon: 'success',
        duration: 2000
      })
      const newList = this.data.storeProducts?.map(item => {
        if (product.id === item.id) {
          return { ...item, status: 'Inactive' }
        }
        return item
      })
      this.setData({
        storeProducts: newList,
        sheetShow: false
      })
      app.globalData.reload = true
    }
    else {
      wx.showToast({
        title: '操作有误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  handleOpenSheet(e: any) {
    this.setData({
      sheetShow: true,
      selectedProduct: e.currentTarget.dataset.product,
      newPrice: e.currentTarget.dataset.product.defaultPrice
    })
  },
  onSheetClose() {
    this.setData({
      sheetShow: false,
    })
  },
  onPriceChange(e: any) {
    this.setData({
      newPrice: e.detail
    })
  },
  onPriceDrug(e: any) {
    this.setData({
      newPrice: e.detail.value,
    });
  },
  async handleUpdatePrice() {
    const selectedProduct = this.data.selectedProduct
    wx.showLoading({ title: '提交中' })
    try {
      await updatePrice(selectedProduct, this.data.newPrice)
      this.setData({
        storeProducts: this.data.storeProducts?.map((item: any) => {
          if (item.id === selectedProduct.id) {
            return { ...item, defaultPrice: this.data.newPrice }
          }
          return item
        })
      })
      wx.hideLoading()
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } catch (err) {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      })
    } finally {
      this.onSheetClose()
    }
  },
  async handleDelete(e: any) {
    let product
    if (e.currentTarget.dataset?.product) {
      product = e.currentTarget.dataset?.product
    } else {
      product = this.data.selectedProduct
    }
    const that = this
    wx.showModal({
      title: '提示',
      content: '确认删除产品',
      async success(res) {
        if (res.confirm) {
          try {
            await deleteProduct(product)
            that.setData({
              storeProducts: that.data.storeProducts.filter((item: any) => item.id !== product.id)
            })
            wx.showToast({ title: '成功删除' })
          } catch (err) {
            console.log(err)
            wx.showToast({ title: '成功失败', icon: 'none' })
          }
        }
      }
    })
  },
  handleShowCanvas() {
    this.setData({
      showCanvasMask: true
    })
    const that = this
    const query = wx.createSelectorQuery()  // 创建一个dom元素节点查询器
    query.select('#productSharingCanvas')              // 选择我们的canvas节点
      .fields({                             // 需要获取的节点相关信息
        node: true,                         // 是否返回节点对应的 Node 实例
        size: true                          // 是否返回节点尺寸（width height）
      }).exec((res) => {                    // 执行针对这个节点的所有请求，exec((res) => {alpiny})  这里是一个回调函数
        const dom = res[0]                            // 因为页面只存在一个画布，所以我们要的dom数据就是 res数组的第一个元素
        const canvas = dom.node                       // canvas就是我们要操作的画布节点
        const ctx = canvas.getContext('2d')           // 以2d模式，获取一个画布节点的上下文对象
        const dpr = wx.getSystemInfoSync().pixelRatio // 获取设备的像素比，未来整体画布根据像素比扩大
        this.setData({
          canvasDom: dom,   // 把canvas的dom对象放到全局
          canvas: canvas,   // 把canvas的节点放到全局
          ctx: ctx,         // 把canvas 2d的上下文放到全局
          dpr: dpr          // 屏幕像素比
        }, function () {
          that.drawing()    // 开始绘图
        })
      })
  },
  closeCanvas() {
    this.setData({
      showCanvasMask: !this.data.showCanvasMask,
      canvasHeight: 0,
      canvasWidth: 0,
      canvasDom: {},
      canvas: null,
    })
    this.data.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
  },
  async drawing() {
    const that = this;
    wx.showLoading({ title: "生成中" }) // 显示loading
    that.drawPoster()               // 绘制海报
      .then(() => {           // 这里用同步阻塞一下，因为需要先拿到海报的高度计算整体画布的高度
        that.drawInfoBg()           // 绘制底部白色背景
        that.drawQrcode('/image/qr_code.jpg')           // 绘制小程序码
        that.drawText()
        wx.hideLoading()            // 隐藏loading
      })
  },
  saveTempFileToProducts() {
    let that = this
    wx.canvasToTempFilePath({
      quality: 1,
      canvas: that.data.canvasDom.node,
      success(res) {
        let productList = that.data.storeProducts

        productList.map((product: any) => {
          if (product.id === that.data.selectedProduct.id) {
            return { ...product, imageTempUrl: res.tempFilePath }
          }
          product
        })
        that.setData({
          storeProducts: productList
        })
      }
    })
  },
  drawPoster() {
    const that = this
    return new Promise(function (resolve, reject) {
      let poster = that.data.canvas.createImage();          // 创建一个图片对象
      poster.src = that.data.selectedProduct.coverImageUrl                      // 图片对象地址赋值
      poster.onload = () => {
        that.computeCanvasSize(poster.width, poster.height) // 计算画布尺寸
          .then(function (res: any) {
            that.roundRect(0, 0, that.data.canvasWidth, that.data.canvasHeight, 10)
            that.data.ctx.drawImage(poster, 0, 0, poster.width, poster.height, 0, 0, res.width, res.height);
            resolve()
          })
      }
    })
  },
  computeCanvasSize(imgWidth: number, imgHeight: number) {
    const that = this
    return new Promise(function (resolve, reject) {
      var canvasWidth = (that.data.canvasDom as any).width                   // 获取画布宽度
      var posterHeight = canvasWidth * (imgHeight / imgWidth)       // 计算海报高度
      var canvasHeight = posterHeight + that.data.bottomInfoHeight  // 计算画布高度 海报高度+底部高度
      that.setData({
        canvasWidth: canvasWidth,                                   // 设置画布容器宽
        canvasHeight: canvasHeight,                                 // 设置画布容器高
        posterHeight: posterHeight                                  // 设置海报高
      }, () => { // 设置成功后再返回
        that.data.canvas.width = that.data.canvasWidth * that.data.dpr // 设置画布宽
        that.data.canvas.height = canvasHeight * that.data.dpr         // 设置画布高
        that.data.ctx.scale(that.data.dpr, that.data.dpr)              // 根据像素比放大
        setTimeout(function () {
          resolve({ "width": canvasWidth, "height": posterHeight })    // 返回成功
        }, 500)
      })
    })
  },
  // 绘制白色背景
  // 注意：这里使用save 和 restore 来模拟图层的概念，防止污染
  drawInfoBg() {
    this.data.ctx.save();
    this.data.ctx.fillStyle = "#ffffff";                                         // 设置画布背景色
    this.data.ctx.fillRect(0, this.data.canvasHeight - this.data.bottomInfoHeight, this.data.canvasWidth, this.data.bottomInfoHeight); // 填充整个画布
    this.data.ctx.restore();
  },
  // 绘制小程序码
  drawQrcode(url: string) {
    let diam = this.data.qrcodeDiam                    // 小程序码直径
    let qrcode = this.data.canvas.createImage();       // 创建一个图片对象
    qrcode.src = url
    qrcode.onload = () => {
      let radius = diam / 2
      let x = this.data.canvasWidth - this.data.infoSpace - diam        // 左上角相对X轴的距离：画布宽 - 间隔 - 直径
      let y = this.data.canvasHeight - this.data.infoSpace - diam + 5   // 左上角相对Y轴的距离 ：画布高 - 间隔 - 直径 + 微调
      this.data.ctx.save()
      this.data.ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI) // arc方法画曲线，按照中心点坐标计算，所以要加上半径
      this.data.ctx.clip()
      this.data.ctx.drawImage(qrcode, 0, 0, qrcode.width, qrcode.height, x, y, diam, diam) // 详见 drawImage 用法
      this.data.ctx.restore();
    }
  },
  drawText() {
    const infoSpace = this.data.infoSpace         // 下面数据间距
    this.data.ctx.save();
    this.data.ctx.font = "bold 16px Arial";             // 设置字体大小
    this.data.ctx.fillStyle = "#101820";           // 设置文字颜色
    // 姓名（距左：间距 + 头像直径 + 间距）（距下：总高 - 间距 - 文字高 - 头像直径 + 下移一点 ）
    this.data.ctx.fillText(this.data.selectedProduct.name, infoSpace, this.data.canvasHeight - infoSpace - 14 - 40, this.data.canvasWidth - infoSpace - this.data.qrcodeDiam - 14);
    this.data.ctx.font = "14px Arial";             // 设置字体大小
    this.data.ctx.fillStyle = "#02A69F";
    // 电话（距左：间距 + 头像直径 + 间距 - 微调 ）（距下：总高 - 间距 - 文字高 - 上移一点 ）
    this.data.ctx.fillText(this.data.tipsOne, infoSpace, this.data.canvasHeight - infoSpace - 14 - 10);
    this.data.ctx.fillStyle = "#101820";
    // 提示语（距左：间距 ）（距下：总高 - 间距 ）
    this.data.ctx.fillText(this.data.tipsTwo, infoSpace, this.data.canvasHeight - infoSpace);
    this.data.ctx.restore();
  },
  handleSavingImage() {
    let that = this;
    wx.canvasToTempFilePath({
      quality: 1,
      canvas: that.data.canvasDom.node,
      success(res) {
        that.setData({
          imageTempUrl: res.tempFilePath
        })
        wx.saveImageToPhotosAlbum({
          filePath: that.data.imageTempUrl,
          success() {
            wx.showToast({
              title: '保存成功，从相册中分享给朋友吧',
              icon: 'none',
              duration: 3000,
            });
          },
          fail() {
            wx.showToast({
              title: '图片保存失败，请稍候重试',
              icon: 'none',
              duration: 3000,
            });
          },
          complete() {
            that.closeCanvas()
          }
        })
      },
      fail() {
        wx.showToast({
          title: '图片生成失败，请稍候重试',
          icon: 'none',
          duration: 2000,
        });
      },
    })
  },
  roundRect(x: number, y: number, w: number, h: number, r: number) {
    this.data.ctx.beginPath();
    this.data.ctx.fillStyle = 'transparent'
    // ctx.strokeStyle('transparent')
    // 左上角
    this.data.ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // border-top
    this.data.ctx.moveTo(x + r, y)
    this.data.ctx.lineTo(x + w - r, y)
    this.data.ctx.lineTo(x + w, y + r)
    // 右上角
    this.data.ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // border-right
    this.data.ctx.lineTo(x + w, y + h - r)
    this.data.ctx.lineTo(x + w - r, y + h)
    // 右下角
    this.data.ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // border-bottom
    this.data.ctx.lineTo(x + r, y + h)
    this.data.ctx.lineTo(x, y + h - r)
    // 左下角
    this.data.ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // border-left
    this.data.ctx.lineTo(x, y + r)
    this.data.ctx.lineTo(x + r, y)

    // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
    this.data.ctx.fill()
    // ctx.stroke()
    this.data.ctx.closePath()
    // 剪切
    this.data.ctx.clip()
  },
})