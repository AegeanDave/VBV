export const Status = {
	FAIL: 'FAIL',
	SUCCESS: 'SUCCESS',
	COMPLETE: 'COMPLETE'
}
export const Image = {
	FRONT: 'FRONT',
	BACK: 'BACK'
}

export const SaleStatus = {
	PUBLISHED: 'Enabled',
	IDLE: 'Idle',
	DELETED: 'Disabled'
}

export const AddressStatus = {
	DISABLED: 'Disabled',
	ENABLED: 'Enabled'
}

export const DBStatus = {
	INACTIVE: 'Inactive',
	ACTIVE: 'Active'
}
export const OrderStatus = {
	UNPAID: 'Unpaid',
	PAID: 'Paid',
	CANCELLED: 'Canceled',
	PENDING: 'Pending',
	SHIPPING: 'Shipping',
	COMPLETE: 'Complete'
}

export const carriers: any = {
	SF: {
		key: 'SF',
		label: '顺丰快递'
	},
	DB: {
		key: 'DB',
		label: '德邦快递'
	},
	ST: {
		key: 'ST',
		label: '申通快递'
	},
	YT: {
		key: 'YT',
		label: '圆通速递'
	},
	ZT: {
		key: 'ZT',
		label: '中通快递'
	},
	YD: {
		key: 'YD',
		label: '韵达快递'
	}
}
export const ProductStatus = {
	PUBLISHED: 'Enabled',
	ONHOLD: 'Disabled'
}

export const WarehouseStatus = {
	NOT_SIGNUP: 'NOT_SIGNUP',
	NOT_REGISTERED: 'NOT_REGISTERED',
	RESET: 'RESET',
	REGISTERED: 'REGISTERED'
}

export const countryCodes: any = {
	CN: {
		value: '86',
		label: '中国',
		key: 'CN'
	},
	CA: {
		value: '1',
		label: '加拿大',
		key: 'CA'
	},
	US: {
		value: '1',
		label: '美国',
		key: 'US'
	}
}
export const addressField = {
	NORMALFORM: 0,
	QUICKFORM: 1
}

export type S3Data = {
	Location: string
}
