/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	// address
	pgm.renameColumn('addresses', 'comment', 'quickInputAddress')

	// warehouse
	pgm.renameColumn('warehouses', 'phone', 'notificationPhoneNumber')
	pgm.renameColumn(
		'warehouses',
		'countryCode',
		'notificationPhoneNumberCountryCode'
	)
	pgm.renameColumn(
		'warehouses',
		'countryCodeAdmin',
		'loginPhoneNumberCountryCode'
	)
	pgm.renameColumn('warehouses', 'phoneAdmin', 'loginPhoneNumber')
	pgm.dropColumns('warehouses', [
		'warehouseNumber',
		'status',
		'password',
		'sessionKey',
		'token'
	])

	// order
	pgm.renameColumn('orders', 'openIdFather', 'openId')
	pgm.renameColumn('orders', 'commentEdited', 'newComment')
	pgm.renameColumn('orders', 'isOrigin', 'isOriginOrder')

	// order detail
	pgm.addColumns('orderDetails', {
		price: {
			type: 'numeric(8,2)'
		},
		openIdFather: {
			type: 'varchar(50)'
		}
	})
	pgm.renameColumn('orderDetails', 'amount', 'quantity')
	pgm.renameColumn('orderDetails', 'company', 'carrier')
	pgm.dropColumns('orderDetails', ['saleId'])

	// inStoreProduct
	pgm.renameColumn('inStoreProducts', 'serialId', 'serialForQRCode')
	pgm.renameColumn('inStoreProducts', 'openIdFather', 'openId')
	pgm.renameColumn('inStoreProducts', 'openIdSource', 'openIdFather')

	// price
	pgm.addColumns('prices', {
		inStoreProductId: {
			type: 'uuid',
			references: '"inStoreProducts"'
		}
	})
	pgm.dropColumns('prices', ['openIdFather', 'productId'])

	// product
	pgm.renameColumn('products', 'needCredential', 'isIdCardRequired')
	pgm.renameColumn('products', 'payWhenArrival', 'isFreeShipping')

	// product image
	pgm.renameColumn('productImages', 'id', 'productImageId')
	pgm.renameColumn('productImages', 'url', 'imageUrl')
	pgm.renameColumn('productImages', 'sortOrder', 'priority')
	pgm.dropColumns('productImages', ['openId'])
}

exports.down = pgm => {}
