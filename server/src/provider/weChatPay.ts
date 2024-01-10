import { Request, Response } from 'express'
import axios from 'axios'
import { generateRandomString, makeCode } from '.'
import { KJUR, hextob64 } from 'jsrsasign'

export const getPrepay = async (req: Request) => {
	const { myOpenId } = req.params
	const { quantity } = req.body
	const bodyParams = {
		appid: process.env.APP_ID,
		mchid: process.env.mch_ID,
		description: '用来关注上级供货商的邀请码',
		out_trade_no: makeCode(),
		amount: {
			total: (Number(process.env.ALIAS_CODE_PRICE) || 5) * quantity,
			currency: 'CNY'
		},
		payer: {
			openid: myOpenId
		}
	}
	const timestamp = Math.round(new Date().getTime() / 1000)
	const oneceStr = generateRandomString(32)
	const privateKey = ``
	const signature = rsaSign(
		`POST\n/v3/pay/transactions/jsapi\n${timestamp}\n${oneceStr}\n${JSON.stringify(
			bodyParams
		)}`,
		privateKey,
		'SHA256withRSA'
	)
	const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.mch_ID}",nonce_str="${oneceStr}",timestamp="${timestamp}",signature="${signature}",serial_no="${process.env.SERIAL_NO}"`
	return axios.post(
		`https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi`,
		bodyParams,
		{
			headers: {
				Authorization
			}
		}
	)
}

const rsaSign = (
	content: string,
	privateKey: string,
	hash = 'SHA256withRSA'
) => {
	const signature = new KJUR.crypto.Signature({
		alg: hash
	})
	signature.init(privateKey)
	signature.updateString(content)
	const signData = signature.sign()
	return hextob64(signData)
}
