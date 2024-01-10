import axios from 'axios'
import { User } from '../models/sequelize'

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

const sendOrderSubscribeMessage = async (
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
			page: 'pages/account/orders/orders',
			miniprogram_state: process.env.miniprogram_state,
			template_id: process.env.ORDER_MESSAGE_TEMP_ID,
			// need new template to update
			data: {
				name1: {
					value: todoUser?.dataValues.username
				},
				thing18: {
					value: ''
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
const sentShippingMessage = async (
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
			miniprogram_state: process.env.miniprogram_state,
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

function generateRandomString(length: number) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		result += characters.charAt(randomIndex)
	}

	return result
}
export {
	login,
	getQRcode,
	makeCode,
	makeOrderNumber,
	getToken,
	makeVerificationCode,
	sendOrderSubscribeMessage,
	sentShippingMessage,
	generateRandomString
}
