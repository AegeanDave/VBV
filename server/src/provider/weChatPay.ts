import { Request } from 'express'
import axios from 'axios'
import { generateRandomString, makeCodeOrderNumber } from '.'
import fs from 'fs'
import WechatPay from 'wechatpay-node-v3'

export const pay = new WechatPay({
	appid: process.env.APP_ID!,
	mchid: process.env.mch_ID!,
	publicKey: fs.readFileSync('./wechat_cert/apiclient_cert.pem'), // 公钥
	privateKey: fs.readFileSync('./wechat_cert/apiclient_key.pem') // 秘钥
})

export const getPrepay = async (req: Request) => {
	const { myOpenId } = req.params
	const { quantity } = req.body
	const totalAmount =
		process.env.NODE_ENV === 'dev'
			? 1
			: (Number(process.env.ALIAS_CODE_PRICE) || 5) * (quantity * 100 || 1)

	const bodyParams = {
		appid: process.env.APP_ID!,
		mchid: process.env.mch_ID!,
		description: '用来关注上级供货商的邀请码',
		out_trade_no: makeCodeOrderNumber(),
		amount: {
			total: totalAmount,
			currency: 'CNY'
		},
		payer: {
			openid: myOpenId
		},
		notify_url: process.env.CALLBACK_URL!
	}

	return pay.transactions_jsapi(bodyParams)
}
