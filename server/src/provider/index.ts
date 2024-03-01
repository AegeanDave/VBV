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
	const currentDate = new Date()
	const year = currentDate.getFullYear().toString().slice(-2)
	const month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
	const day = ('0' + currentDate.getDate()).slice(-2)
	const hours = ('0' + currentDate.getHours()).slice(-2)
	const minutes = ('0' + currentDate.getMinutes()).slice(-2)
	const randomDigits = ('0000' + Math.floor(Math.random() * 10000)).slice(-4)
	const orderNumber = year + month + day + hours + minutes + randomDigits

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
