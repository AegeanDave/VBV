const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

export const handleVerify = (to: string, code: string) =>
	client.verify
		.services('YOUR VERIFY SERVICE SID')
		.verificationChecks.create({ to: '+' + to, code })

export const sendRegistrationSMS = (to: string) =>
	client.verify.v2
		.services('VAa0d3a7a76087133668bd18d68c53a33c')
		.verifications.create({ to: '+' + to, channel: 'sms' })

export const sendNewOrderSMS = (to: string) =>
	client.messages.create({
		body: `您有新订单了，请点击查看${process.env.ORDER_URL}`,
		from: `+${process.env.TWILIO_SENDER_PHONE}`,
		to: `+${to}`
	})
