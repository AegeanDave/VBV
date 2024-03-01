import { reLogin } from "../services";

const { miniProgram: { envVersion } } = wx.getAccountInfoSync()

let url = ''
switch (envVersion) {
  case 'develop':
    url = "https://api.vbangv.com/api";
    break;
  case 'trial':
    url = "https://api.vbangv.com/api";
    break;
  case 'release':
    url = "https://api.vbangv.com/api";
    break;
  default:
    break;
}

const request = {
  deleteRequest: function (endPoint: string, data: object) {
    const sessionKey = wx.getStorageSync('sessionKey');
    return new Promise(function (resolve: any, reject: any) {
      wx.request({
        url: url + "/" + endPoint,
        method: "DELETE",
        header: {
          Authorization: sessionKey
        },
        data: data,
        success: function (res) {
          var result = res.data;
          resolve(result);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
  postRequest: function (endPoint: string, data?: object) {
    const sessionKey = wx.getStorageSync('sessionKey');
    return new Promise(function (resolve: any, reject: any) {
      wx.request({
        url: url + "/" + endPoint,
        method: "POST",
        header: {
          Authorization: sessionKey
        },
        data: data,
        success: async function (res) {
          if (res.statusCode === 403) {
            await wx.showToast({
              title: '登录失效',
              icon: 'none',
              duration: 1000
            })
            reLogin()
          }
          else {
            var result = res.data;
            resolve(result);
          }
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
  bufferRequest: function (endPoint: string, data?: object) {
    const sessionKey = wx.getStorageSync('sessionKey');
    return new Promise(function (resolve: any, reject: any) {
      wx.request({
        url: url + "/" + endPoint,
        method: "POST",
        responseType: 'arraybuffer',
        header: {
          Authorization: sessionKey
        },
        data: data,
        success: async function (res) {
          if (res.statusCode === 403) {
            await wx.showToast({
              title: '登录失效',
              icon: 'none',
              duration: 1000
            })
            reLogin()
          }
          else {
            var result = res.data;
            resolve(result);
          }
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
  getRequest: function (endPoint: string, data?: object) {
    const sessionKey = wx.getStorageSync('sessionKey');
    return new Promise(function (resolve: any, reject: any) {
      wx.request({
        url: url + "/" + endPoint,
        method: "GET",
        header: {
          Authorization: sessionKey
        },
        data: data,
        success: async function (res) {
          if (res.statusCode === 403) {
            await wx.showToast({
              title: '登录失效',
              icon: 'none',
              duration: 2000
            })
            reLogin()
          }
          else {
            var result = res.data;
            resolve(result as any);
          }
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
  paymentRequest: function (params: any) {
    return new Promise(function (resolve: any, reject: any) {
      wx.requestPayment(
        {
          ...params,
          'success': function (res) {
            resolve(res)
          },
          'fail': function (res) {
            reject(res)
          }
        })
    })
  },
  uploadImage: function (endPoint: string, filePath: string, name: string, data?: any) {
    const sessionKey = wx.getStorageSync('sessionKey');
    return new Promise(function (resolve: any, reject: any) {
      wx.uploadFile({
        url: url + "/" + endPoint,
        filePath: filePath,
        name: name,
        header: {
          'content-type': 'multipart/form-data',
          'Authorization': sessionKey
        },
        formData: data,
        success: function (res) {
          var result = res.data;
          resolve(result);
        },
        fail: function (err) {
          reject(err);
        }
      })
    })
  }
};
export default request
