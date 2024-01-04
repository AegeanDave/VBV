import { getMyStore, publishProduct, unpublishProduct } from "../../services/api/api"
import { Product, IAppOption } from "../../models/index"
import { Status, Mode } from "../../constant/index"
import { generateQRcode } from '../../services/QRcode'
import Toast from '@vant/weapp/toast/toast';

const app = getApp<IAppOption>()

Page({
  data: {
    myProductList: [],
    showCanvasMask: true,
    allFathersProducts: [],
    selectedProduct: null,
    storeActionSheetShow: false,
    dealerActionSheetShow: false,
    storeActions: [
      { text: '生成朋友圈分享图', value: 1 },
      { text: '改价', value: 2 },
      { text: '预览', value: 3 },
      { text: '下架', value: 4 }
    ],
    recommendationActions: [{ text: '我要售卖', value: 6 }],
    dialogShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],

    // 设置区，针对部件的数据设置
    qrcodeDiam: 80,               // 小程序码直径
    infoSpace: 14,                // 底部信息的间距
    saveImageWidth: 500,          // 保存的图像宽度
    bottomInfoHeight: 100,        // 底部信息区高度
    tipsOne: "长按识别二维码",   // 提示语
    tipsTwo: "进入微帮微购好货",   // 提示语

    // 缓冲区，无需手动设定
    QRcode: null as Object,
    canvasWidth: 0,               // 画布宽
    canvasHeight: 0,              // 画布高
    canvasDom: {} as Object,              // 画布dom对象
    canvas: null as any,                  // 画布的节点
    ctx: null as any,                    // 画布的上下文
    dpr: 1,                       // 设备的像素比
    posterHeight: 0,
  },
  onLoad: async function () {
    const { myProducts, availableProducts }: any = await getMyStore()
    this.setData({
      myProductList: myProducts,
      allFathersProducts: availableProducts
    })
  },
  async onShow() {
    if (app.globalData.reload) {
      const { myProducts, availableProducts }: any = await getMyStore()
      this.setData({
        myProductList: myProducts,
        allFathersProducts: availableProducts
      })
      app.globalData.reload = false
    }
  },
  bindAddToStore: function () {
    const isDuplicate = this.data.myProductList?.some(item => item.productId === this.data.selectedProduct.productId)
    if (isDuplicate) {
      Toast('此商品已在您的商店中');
      return
    }
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PUBLISHING}&id=${this.data.selectedProduct.id}`,
    })
  },
  bindPreview: function () {
    wx.navigateTo({
      url: `../index/productDetail/productDetail?mode=${Mode.PREVIEW}&id=${this.data.selectedProduct.id}`,
    })
  },
  bindPublish: async function () {
    const product = this.data.selectedProduct
    const result: any = await publishProduct(product)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '成功上架',
        icon: 'success',
        duration: 2000
      })
      const newList = this.data.myProductList?.map(item => {
        if (product.id === item.id) {
          return { ...product, status: 'Active' }
        }
        return product
      })
      this.setData({
        myProductList: newList
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
  bindUnpublish: async function () {
    const product = this.data.selectedProduct
    const result: any = await unpublishProduct(product)
    if (result.status === Status.SUCCESS) {
      wx.showToast({
        title: '已下架',
        icon: 'success',
        duration: 2000
      })
      const newList = this.data.myProductList.map(item => {
        if (product.id === item.id) {
          return { ...product, status: 'Inactive' }
        }
        return product
      })
      this.setData({
        myProductList: newList
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
  onShowDealerActionSheet(e: any) {
    if (e.currentTarget.dataset.newproduct) {
      this.setData({
        groups: [
          { text: '我要售卖', value: 6 }
        ],
        dealerActionSheetShow: true,
        selectedProduct: e.currentTarget.dataset.newproduct,
      })
    }
  },
  onShowStoreActionSheet(e: any) {
    const product = e.currentTarget.dataset.product
    if (product.status === 'Inactive') {
      this.setData({
        storeActions: [
          { text: '上架', value: 5 }
        ]
      })
    }
    if (product.status === 'Active') {
      this.setData({
        storeActions: [
          { text: '生成朋友圈分享图', value: 1 },
          { text: '改价', value: 2 },
          { text: '预览', value: 3 },
          { text: '下架', value: 4 }
        ],
      })
    }
    if (product.status === 'Not_Available') {
      wx.showToast({
        title: '请联系商家',
        icon: "error"
      })
      return
    }
    this.setData({
      storeActionSheetShow: true,
      selectedProduct: product,
    })
  },
  close: function () {
    this.setData({
      storeActionSheetShow: false,
      dealerActionSheetShow: false
    })
  },
  onDialogClick(e: any) {
    switch (e.detail.index) {
      case 0:
        break;
      case 1:
        this.bindUnpublish()
        break;
    }
    this.setData({
      dialogShow: false,
    })
  },
  handleUpdatePrice() {
    const selectedProduct = this.data.selectedProduct

  },
  onActionClick(e: any) {
    const optionValue = e.detail.value
    switch (optionValue) {
      case 1:
        this.setData({
          showCanvasMask: !this.data.showCanvasMask
        })
        this.drawImage()
        break;
      case 2:
        this.handleUpdatePrice()
        break;
      case 3:
        this.bindPreview()
        break;
      case 4:
        this.setData({
          dialogShow: !this.data.dialogShow
        })
        break;
      case 5:
        this.bindPublish()
        break;
      case 6:
        this.bindAddToStore()
        break;
      default:
        break;
    }
    this.close()
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
  drawImage() {
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
          this.drawing()    // 开始绘图
        })
      })
  },
  async drawing() {
    const that = this;
    wx.showLoading({ title: "生成中" }) // 显示loading
    const url = await generateQRcode(that.data.currentProduct.dealerSale.serialForQRCode as number)
    that.drawPoster()               // 绘制海报
      .then(function () {           // 这里用同步阻塞一下，因为需要先拿到海报的高度计算整体画布的高度
        that.drawInfoBg()           // 绘制底部白色背景
        that.drawQrcode(url as string)           // 绘制小程序码
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
        let productList = that.data.myProductList
        productList.forEach((product: Product, index: number) => {
          if (product.dealerSale.serialForQRCode === that.data.currentProduct.dealerSale.serialForQRCode) {
            productList[index].imageTempUrl = res.tempFilePath
          }
        });
        that.setData({
          myProductList: productList
        })
      }
    })
  },
  drawPoster() {
    const that = this
    return new Promise(function (resolve, reject) {
      let poster = that.data.canvas.createImage();          // 创建一个图片对象
      poster.src = that.data.currentProduct.coverImageURL                      // 图片对象地址赋值
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
    this.data.ctx.fillText(this.data.currentProduct.productName, infoSpace, this.data.canvasHeight - infoSpace - 14 - 40, this.data.canvasWidth - infoSpace - this.data.qrcodeDiam - 14);
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