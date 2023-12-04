export type Product = {
	productId: string
	productName: string
	productDescription: string
	coverImageURL: string
	images: string[]
	quantity: number
	idCardRequired: boolean
	freeShipping: boolean
	dealerSale: Sale
	mySale?: Sale
}

export type WarehouseProduct = {
	productId: string
	productName: string
	productDescription: string
	coverImageURL: string
	images: Image[]
	idCardRequired: boolean
	freeShipping: boolean
	price: string | number
}
export type Image = {
	id: string
	url: string
	tmpImage?: boolean
	file?: File
}
type Sale = {
	openId: string
	openIdFather: string
	name: string
	avatar: string
	price: string | number
	priceId?: string
	inStoreProductId: string
	status: string
}
export type SaleOrder = {
	orderId: string
	orderNumber: string
	originOrderId: string
	status: OrderStatus
	buyer: User
	createdAt: string
	subOrders: SubOrder[]
	lastUpdatedAt: string
	address: Address
	comment?: string
	commentEdited?: string
}

export type PurchasedOrder = {
	orderNumber: string
	originOrderId: string
	subOrders: SubOrder[]
	address: Address
	createdAt: string
	lastUpdatedAt: string
	comment?: string
	commentEdited?: string
}

export type SubOrder = {
	orderId?: string
	status?: OrderStatus
	dealer: User
	orderProducts: OrderProduct[]
}

export type OrderProduct = {
	productId: string
	productName: string
	productDescription: string
	coverImageURL: string
	price: string | number
	quantity: number
	openIdFather: string
	trackingNumber: string
	carrier: string
	status: ShipmentStatus
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
type OrderStatus = 'Paid' | 'Unpaid' | 'Canceled'
type ShipmentStatus = 'Pending' | 'Canceled' | 'Shipping'
export type Session = {
	openId: string
	warehouseId: string
}
