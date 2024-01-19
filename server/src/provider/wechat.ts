import { Request } from 'express'
import axios from 'axios'
import { User } from '../models/sequelize'
import { makeCodeOrderNumber } from '.'
import fs from 'fs'
import WechatPay from 'wechatpay-node-v3'

export const pay = new WechatPay({
	appid: process.env.APP_ID!,
	mchid: process.env.mch_ID!,
	publicKey: fs.readFileSync('./wechat_cert/apiclient_cert.pem'), // 公钥
	privateKey: fs.readFileSync('./wechat_cert/apiclient_key.pem') // 秘钥
})
export const getToken = () =>
	axios.get('https://api.weixin.qq.com/cgi-bin/token', {
		params: {
			appid: process.env.APP_ID,
			secret: process.env.APP_SECRET,
			grant_type: 'client_credential'
		}
	})
const getQRcode = async (data: any) => {
	const accessToken = await getToken()
	const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken.data.access_token}`
	return axios({
		headers: { 'Content-type': 'application/json' },
		method: 'post',
		url,
		responseType: 'arraybuffer',
		data: {
			page: 'pages/index/productQRcode/productQRcode',
			scene: data.serialID
		}
	})
}

export const sendOrderSubscribeMessage = async (
	orderNumber: string,
	userId: string,
	openIdDealer: string,
	createdAt: string,
	comment?: string
) => {
	const {
		data: { access_token }
	} = await getToken()
	const todoUser = await User.findByPk(userId, { attributes: ['username'] })
	return axios.post(
		`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
		{
			touser: openIdDealer,
			page: `pages/soldOrders/orderDetail/orderDetail?orderNumber=${orderNumber}&customerId=${userId}`,
			miniprogram_state: process.env.MINIPROGRAM_STATE || 'trial',
			template_id: process.env.ORDER_MESSAGE_TEMP_ID,
			lang: 'zh_CN',
			// need new template to update
			data: {
				name1: {
					value: todoUser?.dataValues.username
				},
				character_string4: {
					value: orderNumber
				},
				date2: {
					value: createdAt
				},
				thing3: {
					value: comment || '您有新订单未处理，请及时处理'
				}
			}
		}
	)
}

export const login = (code: string) =>
	axios.get('https://api.weixin.qq.com/sns/jscode2session', {
		params: {
			appid: process.env.APP_ID,
			secret: process.env.APP_SECRET,
			js_code: code,
			grant_type: 'authorization_code'
		}
	})

export const sendShippingSubscribeMessage = async (
	orderNumber: string,
	trackingNumber: string,
	trackingCompany: string,
	openId: string,
	updatedAt: string
) => {
	const tokenResult = await getToken()

	return axios.post(
		`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${tokenResult.data.access_token}`,
		{
			access_token: tokenResult.data.access_token,
			touser: openId,
			// page:
			// 	'pages/account/followingAndFollower/followingAndFollower?group=following',
			template_id: process.env.SHIPMENT_MESSAGE_TEMP_ID,
			miniprogram_state: process.env.MINIPROGRAM_STATE || 'trial',
			lang: 'zh_CN',
			// need new template to update
			data: {
				character_string1: {
					value: trackingNumber
				},
				thing2: {
					value: trackingCompany
				},
				time3: {
					value: updatedAt
				}
			}
		}
	)
}

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
