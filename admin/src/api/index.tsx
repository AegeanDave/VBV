import axios from 'axios'
import { Product, Order, Image } from '../models/index'
import { History } from 'history'

interface Auth {
	entirePhoneNumber: string
	verificationCode: string
}

axios.interceptors.response.use(
	response => response,
	err => {
		if (!err.response.status || err.response.status === 403) {
			localStorage.clear()
			window.location.href = '/login'
		}
		return Promise.resolve(err)
	}
)
axios.defaults.headers = { authorization: localStorage.getItem('sessionKey') }
axios.defaults.baseURL = process.env.REACT_APP_URL

export const login = async (auth: Auth) => {
	const result = await axios.post('/warehouse/login', auth)
	localStorage.setItem('sessionKey', result.data.sessionKey)
	localStorage.setItem('name', result.data.name)
	localStorage.setItem('email', result.data.email)
	result.data.countryCode &&
		localStorage.setItem(
			'countryCode',
			result.data.notificationPhoneNumberCountryCode
		)
	result.data.phone &&
		localStorage.setItem('phone', result.data.notificationPhoneNumber)
	localStorage.setItem('smsService', result.data.smsService)
	localStorage.setItem('emailService', result.data.emailService)
	axios.defaults.headers = { authorization: result.data.sessionKey }
	return result
}
export const logout = (history: History) => {
	axios.delete('/warehouse/logout')
	localStorage.clear()
	history.push('/login')
}
export const getProducts = async () =>
	await axios.get('/warehouse/myWarehouseProducts')

export const getOrders = async () => await axios.get('/warehouse/allSaleOrders')
export const updateProductInfo = async (
	product: Product,
	action: string,
	uploadCoverImage?: File
) => {
	const formData = new FormData()
	if (uploadCoverImage) {
		formData.append('coverImage', uploadCoverImage)
	}
	product.images.forEach((image: Image) => {
		formData.append(image.id, image.file as File)
	})
	formData.append('product', JSON.stringify(product))
	formData.append('action', action)
	const result = await axios.post('/warehouse/newProduct', formData)
	return result
}
export const updateProductStatus = async (product: Product, action: string) => {
	const result = await axios.post('/warehouse/updateSale', {
		product: {
			saleId: product.inStoreProductId,
			productId: product.productId,
			price: product.price
		},
		action: action
	})

	return result
}

export const updateOrder = async (order: Order, action: string) => {
	const result = await axios.post('/warehouse/updateOrder', {
		order: order,
		action: action
	})

	return result
}

export const download = (url: string) => {
	return new Promise((resolve, reject) => {
		axios('/warehouse/download', {
			method: 'GET',
			params: {
				url: url
			}
		})
			.then(response => {
				resolve(response.data.Body)
			})
			.catch(err => {
				reject(err)
			})
	})
}

export const sendSMSVerifcation = (phone: {
	countryCode: string
	tel: string
}) => axios.post('/warehouse/sms', { phone })

export const getVerificationCode = (phone: {
	countryCode: string
	tel: string
}) => axios.post('/warehouse/getVerificationCode', { phone })

export const verification = (verificationCode: string) =>
	axios.post('/warehouse/phoneVerification', { verificationCode })

export const saveSetting = (emailService: boolean, smsService: boolean) =>
	axios.post('/warehouse/updateSetting', { emailService, smsService })
