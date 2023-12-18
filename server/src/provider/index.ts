import axios from 'axios'
import { query } from '../services'
import { queryName } from '../services/queryName'

const login = (code: string) =>
	axios.get('https://api.weixin.qq.com/sns/jscode2session', {
		params: {
			appid: process.env.APP_ID,
			secret: process.env.APP_SECRET,
			js_code: code,
			grant_type: 'authorization_code'
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

const getToken = () =>
	axios.get('https://api.weixin.qq.com/cgi-bin/token', {
		params: {
			appid: process.env.APP_ID,
			secret: process.env.APP_SECRET,
			grant_type: 'client_credential'
		}
	})
const sendSubscribeMessage = async (
	orderNumber: string,
	openId: string,
	createdAt: string,
	openIDFather: string
) => {
	const tokenResult = await getToken()
	const getBuyerName = await query(queryName.getUserName, [openId])
	return axios.post(
		'https://api.weixin.qq.com/cgi-bin/message/subscribe/send',
		{
			access_token: tokenResult.data.access_token,
			touser: openIDFather,
			page: 'pages/account/orders/orders',
			miniprogram_state: process.env.miniprogram_state,
			template_id: 'GtlvtLoN0wUrr5EKt84_yD9SpFSNH2skL7PKIOrCrXE',
			// need new template to update
			data: {
				character_string1: {
					value: orderNumber
				},
				thing18: {
					value: getBuyerName.data[0].name
				},
				time19: {
					value: createdAt
				},
				thing12: {
					value: '您有新订单未处理，请及时处理'
				}
			}
		},
		{
			params: {
				access_token: tokenResult.data.access_token
			}
		}
	)
}
const sentShippingMessage = async (
	orderNumber: string,
	trackingNumber: string,
	trackingCompany: string,
	openID: string
) => {
	const tokenResult = await getToken()

	return axios.post(
		'https://api.weixin.qq.com/cgi-bin/message/subscribe/send',
		{
			access_token: tokenResult.data.access_token,
			touser: openID,
			// page:
			// 	'pages/account/followingAndFollower/followingAndFollower?group=following',
			template_id: 'xsHbpWWEeNfDkS4bYLSF1B6N2sOxwRtxoHsew69Jvmc',
			miniprogram_state: process.env.miniprogram_state,
			// need new template to update
			data: {
				character_string1: {
					value: orderNumber
				},
				thing5: {
					value: '商家已发货'
				},
				character_string9: {
					value: trackingNumber
				},
				thing8: {
					value: trackingCompany
				}
			}
		},
		{
			params: {
				access_token: tokenResult.data.access_token
			}
		}
	)
}
const makeCode = () => {
	let result = ''
	const characters: string =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength: number = characters.length
	for (let i = 0; i < 13; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}
const makeVerificationCode = () => {
	let result = ''
	const characters: string = '0123456789'
	const charactersLength: number = characters.length
	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}
const makeOrderNumber = () => {
	const charaterInit = '0123456789'
	let orderNumber = ''
	for (let i = 0; i < 13; i++) {
		const randomIndex = Math.floor(Math.random() * charaterInit.length)
		orderNumber += charaterInit.charAt(randomIndex)
	}
	return orderNumber
}
export {
	login,
	getQRcode,
	makeCode,
	makeOrderNumber,
	getToken,
	makeVerificationCode,
	sendSubscribeMessage,
	sentShippingMessage
}
