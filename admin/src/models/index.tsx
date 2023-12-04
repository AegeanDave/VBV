export type Product = {
	productName: string
	productId?: string
	inStoreProductId?: string
	uploadImages?: any[]
	createdAt?: string
	productDescription: string
	images: Image[]
	coverImageURL: string
	price: number
	quantity?: number
	status?: string
	lastUpdatedAt?: string
	idCardRequired: boolean
	freeShipping: boolean
	openID?: string
	agreementChecked?: boolean
}
export type SaleProduct = {
	productId?: string
	inStoreProductId: string
	price: number
	quantity: number
	status: string
}
export type Order = {
	originOrderId: string
	orderNumber: string
	status: 'Paid' | 'Unpaid' | 'Canceled' | 'Deny'
	orderId: string
	buyer: User
	lastUpdatedAt: Date
	createdAt: Date
	orderProducts: Product[]
	address: Address
	comment?: string
	newComment?: string
	company?: string
	trackingStatus: 'Pending' | 'Canceled' | 'Shipping'
	trackingNumber?: string
}

type User = {
	openId: string
	name: string
	avatar: string
}
export type Address = {
	addressId: string
	name: string
	phone: string
	country: string
	province: string
	city: string
	street: string
	idFrontImage?: string
	idBackImage?: string
	quickInputAddress?: string
}
export type Image = {
	id: string
	url: string
	tmpImage?: boolean
	priority?: number
	file?: File
}
export interface Column {
	type: 'images' | 'productName' | 'price'
	label: string
	minWidth?: number
	align?: 'center'
	format?: (value: number) => string
}

export type SnackBarProps = {
	type: 'success' | 'info' | 'warning' | 'error'
	message: string
}
