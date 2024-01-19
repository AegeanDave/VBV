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
export type OrderType = {
	id: string
	orderNumber: string
	groupId: string
	userId: string
	dealerId: string
	payment: any
	status: OrderStatus
	createdAt: string
	orderDetails?: any[]
	updatedAt: string
	address: any
	comment?: string
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
	id: string
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
type OrderStatus = 'Paid' | 'Unpaid' | 'Cancelled' | 'Completed'
type ShipmentStatus = 'Pending' | 'Cancelled' | 'Shipping'
export type Session = {
	openId: string
	warehouseId: string
}
