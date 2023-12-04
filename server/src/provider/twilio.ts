const accountSid = 'AC2f03d35177ded303e4d1fc59462d6853'
const authToken = 'd4ab80eb9cef5396c93300d75e786ac7'
const client = require('twilio')(accountSid, authToken)

export const sendVerifiySMS = (to: string, verificationCode: string) =>
	client.messages.create({
		body: `【微帮微】验证码：${verificationCode}`,
		from: `+${process.env.TWILIO_SENDER_PHONE}`,
		to: `+${to}`
	})

export const sendRegistrationSMS = (to: string, verificationCode: string) =>
	client.messages.create({
		body: `【微帮微】你的微帮微仓库登录验证码为：${verificationCode}。验证码有效时间为30分钟。如非本人操作，可忽略本消息。`,
		from: `+${process.env.TWILIO_SENDER_PHONE}`,
		to: `+${to}`
	})

export const sendNewOrderSMS = (to: string) =>
	client.messages.create({
		body: `您有新订单了，请点击查看${process.env.ORDER_URL}`,
		from: `+${process.env.TWILIO_SENDER_PHONE}`,
		to: `+${to}`
	})
