import { Request, Response } from 'express'
import queryString from 'querystring'
import crypto from 'crypto'
import { makeCode } from './index'
const tenpay = require('tenpay')

const apiKey = process.env.api_Key
const mchID = process.env.mch_ID
const appID = process.env.APP_ID
const price = process.env.ALIAS_CODE_PRICE

const wechatPay = async (req: Request, openID: string) => {
	const getSign = (signParams: any) => {
		const stringA =
			'appId=' +
			signParams.appid +
			'&nonceStr=' +
			signParams.nonceStr +
			'&package=' +
			signParams.package +
			'&signType=MD5' +
			'&timeStamp=' +
			signParams.timeStamp

		const stringSignTemp = stringA + '&key=' + apiKey

		return crypto
			.createHash('md5')
			.update(queryString.unescape(stringSignTemp), 'utf8')
			.digest('hex')
			.toUpperCase()
	}
	const clientIP =
		req.headers['X-Forwarded-For'] ||
		req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress

	const config = {
		appid: appID,
		mchid: mchID,
		partnerKey: apiKey,
		notify_url: 'http://www.weixin.qq.com/wxpay/pay.php',
		spbill_create_ip: clientIP
	}
	const api = new tenpay(config)
	const sandboxAPI = await tenpay.sandbox(config)
	const result = await api.unifiedOrder({
		out_trade_no: makeCode(),
		body: '购买单个邀请码',
		total_fee: price,
		openid: openID
	})
	const paymentParam: { [key: string]: string } = {
		appid: result.appid,
		timeStamp: JSON.stringify(Date.now()),
		nonceStr: result.nonce_str,
		package: 'prepay_id=' + result.prepay_id,
		signType: 'MD5'
	}
	paymentParam.paySign = getSign(paymentParam)
	return paymentParam
}

export default wechatPay
