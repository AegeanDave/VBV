const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

export const handleVerify = (to: string, code: string) =>
	client.verify.v2
		.services(process.env.TWILIO_PRODUCT_TOKEN!)
		.verificationChecks.create({ to: '+' + to, code })

export const sendRegistrationSMS = (to: string) =>
	client.verify.v2
		.services(process.env.TWILIO_PRODUCT_TOKEN!)
		.verifications.create({ to: '+' + to, channel: 'sms' })

export const sendNewOrderSMS = (to: string) =>
	client.messages.create({
		body: `您有新订单了，请点击查看
${process.env.ADMIN_URL}/order`,
		from: `+${process.env.TWILIO_SENDER_PHONE}`,
		to: `+${to}`
	})
