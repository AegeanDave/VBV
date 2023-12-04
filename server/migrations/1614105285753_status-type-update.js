/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.alterColumn('products', 'status', {
		type: 'status_type',
		default: 'Enabled',
		using: 'status::status_type',
		notNull: true
	})

	pgm.alterColumn('addresses', 'status', {
		default: null
	})

	pgm.alterColumn('addresses', 'status', {
		type: 'status_type',
		default: 'Enabled',
		using: 'status::status_type',
		notNull: true
	})

	pgm.alterColumn('connections', 'status', {
		default: null
	})

	pgm.alterColumn('connections', 'status', {
		type: 'status_type',
		default: 'Enabled',
		using: 'status::status_type',
		notNull: true
	})

	pgm.alterColumn('invitations', 'status', {
		type: 'status_type',
		default: 'Enabled',
		using: 'status::status_type',
		notNull: true
	})

	pgm.alterColumn('inStoreProducts', 'status', {
		type: 'in_store_type',
		default: 'Enabled',
		using: 'status::in_store_type',
		notNull: true
	})

	pgm.alterColumn('orders', 'status', {
		type: 'order_status_type',
		default: 'Unpaid',
		using: 'status::order_status_type',
		notNull: true
	})

	pgm.alterColumn('orderDetails', 'status', {
		type: 'order_detail_status_type',
		default: 'Pending',
		using: 'status::order_detail_status_type',
		notNull: true
	})
}

exports.down = pgm => {}
