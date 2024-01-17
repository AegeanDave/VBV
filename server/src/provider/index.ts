import {
	login,
	sendShippingSubscribeMessage,
	sendOrderSubscribeMessage
} from './wechat'

const makeCode = () => {
	let result = ''
	const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	const charactersLength: number = characters.length
	for (let i = 0; i < 13; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}
const makeCodeOrderNumber = () => {
	let result = ''
	const characters: string = '0123456789'
	const charactersLength: number = characters.length
	for (let i = 0; i < 10; i++) {
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
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	let result = ''

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		result += characters.charAt(randomIndex)
	}

	return result
}
export {
	login,
	makeCode,
	makeOrderNumber,
	makeCodeOrderNumber,
	sendOrderSubscribeMessage,
	sendShippingSubscribeMessage,
	generateRandomString
}
