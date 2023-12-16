import { reLogin } from "../services";

const { miniProgram: { envVersion } } = wx.getAccountInfoSync()

let url = ''

switch (envVersion) {
  case 'develop':
    url = "http://localhost:8080/api";
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
        success: function (res) {
          if (res.statusCode === 403) {
            wx.showToast({
              title: '失败请重试',
              icon: 'none'
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
        success: function (res) {
          if (res.statusCode === 403) {
            wx.showToast({
              title: '失败请重试',
              icon: 'none'
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
          'timeStamp': params.timeStamp,
          'nonceStr': params.nonceStr,
          'package': params['package'],
          'signType': params.signType,
          'paySign': params.paySign,
          'success': function (res) {
            resolve(res)
          },
          'fail': function (res) {
            reject(res)
          }
        })
    })
  },
  uploadImage: function (endPoint: string, filePath: string, data: any) {
    const sessionKey = wx.getStorageSync('sessionKey');
    return new Promise(function (resolve: any, reject: any) {
      wx.uploadFile({
        url: url + "/" + endPoint,
        filePath: filePath,
        name: 'avatar',
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
