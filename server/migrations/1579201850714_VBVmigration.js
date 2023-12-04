/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.createExtension('uuid-ossp')
	pgm.createTable('users', {
		openId: { type: 'varchar(50)', notNull: true, primaryKey: true },
		username: { type: 'varchar(50)' },
		avatarUrl: { type: 'text' },
		holdingCodeNumber: { type: 'int', notNull: true, default: 5 },
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
	pgm.createTable('products', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		ownerId: { type: 'varchar(50)', notNull: true, references: '"users"' },
		name: { type: 'varchar(50)', notNull: true },
		description: 'text',
		needCredential: { type: 'boolean', notNull: true, default: false },
		payWhenArrival: { type: 'boolean', notNull: true, default: false },
		status: {
			type: 'varchar(20)',
			notNull: true
		},
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
	pgm.createTable('productImages', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		openId: { type: 'varchar(50)', notNull: true, references: '"users"' },
		productId: {
			type: 'uuid',
			notNull: true,
			references: '"products"'
		},
		isCoverImage: { type: 'boolean', notNull: true, default: false },
		url: {
			type: 'varchar(199)',
			notNull: true
		},
		sortOrder: 'int'
	})
	pgm.createTable('prices', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		openIdFather: { type: 'varchar(50)', notNull: true },
		openIdChild: { type: 'varchar(50)', notNull: true },
		productId: {
			type: 'uuid',
			notNull: true,
			references: '"products"'
		},
		price: { type: 'numeric(8,2)', notNull: true },
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
	pgm.createTable('inStoreProducts', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		productId: {
			type: 'uuid',
			notNull: true,
			references: '"products"'
		},
		openIdFather: {
			type: 'varchar(50)',
			notNull: true
		},
		openIdSource: {
			type: 'varchar(50)',
			notNull: true
		},
		defaultPrice: { type: 'numeric(8,2)', notNull: true },
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		status: 'varchar(12)'
	})
	pgm.createTable('addresses', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		openId: { type: 'varchar(50)', notNull: true, references: '"users"' },
		street: {
			type: 'varchar(255)'
		},
		city: {
			type: 'varchar(20)'
		},
		province: { type: 'varchar(50)', notNull: true },
		country: { type: 'varchar(50)', notNull: true },
		name: { type: 'varchar(20)', notNull: true },
		phone: { type: 'varchar(20)', notNull: true },
		idPhotoFrontUrl: 'text',
		idPhotoBackUrl: 'varchar(99)',
		comment: { type: 'text' },
		status: { type: 'varchar(20)', default: 'ENABLED' },
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
	pgm.createTable('orders', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true
		},
		orderNumber: {
			type: 'varchar(20)',
			notNull: true
		},
		originalOrderId: {
			type: 'uuid',
			notNull: true
		},
		isOrigin: { type: 'boolean', notNull: true, default: false },
		totalPrice: {
			type: 'numeric(8,2)'
		},
		comment: { type: 'text' },
		commentEdited: { type: 'text' },
		addressId: 'uuid',
		openIdFather: { type: 'varchar(50)', notNull: true },
		openIdChild: { type: 'varchar(50)', notNull: true },
		status: 'varchar(20)',
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
	pgm.createTable('orderDetails', {
		orderId: {
			type: 'uuid',
			notNull: true
		},
		originalOrderId: {
			type: 'uuid',
			notNull: true
		},
		productId: { type: 'uuid', notNull: true, references: '"products"' },
		amount: 'int',
		company: { type: 'varchar(10)', default: 'PENDING' },
		trackingNumber: {
			type: 'varchar(30)',
			default: 'PENDING'
		},
		comment: { type: 'text' },
		status: 'varchar(20)'
	})
	pgm.createTable('connections', {
		id: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		openId: { type: 'varchar(50)', notNull: true },
		openIdChild: { type: 'varchar(50)', notNull: true },
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		status: {
			type: 'varchar(20)',
			notNull: true,
			default: 'ENABLED'
		}
	})
	pgm.createTable('invitations', {
		openId: { type: 'varchar(50)', notNull: true, references: '"users"' },
		code: { type: 'varchar(12)', notNull: true, primaryKey: true },
		status: {
			type: 'varchar(20)',
			notNull: true
		},
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		lastUpdatedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
	pgm.createTable('warehouses', {
		openId: { type: 'varchar(50)', notNull: true, references: '"users"' },
		countryCode: { type: 'varchar(5)' },
		warehouseId: {
			type: 'uuid',
			notNull: true,
			primaryKey: true,
			default: pgm.func('uuid_generate_v4()')
		},
		phone: { type: 'varchar(20)' },
		smsService: { type: 'boolean', notNull: true, default: false },
		emailService: { type: 'boolean', notNull: true, default: false },
		warehouseNumber: {
			type: 'serial'
		},
		status: { type: 'varchar(20)', notNull: true },
		email: { type: 'TEXT', notNull: true, unique: true },
		password: {
			type: 'TEXT'
		},
		sessionKey: {
			type: 'uuid'
		},
		token: {
			type: 'uuid',
			default: pgm.func('uuid_generate_v4()')
		}
	})
}

exports.down = pgm => {}
