/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.createType('status_type', ['Enabled', 'Disabled'])
	pgm.createType('in_store_type', ['Enabled', 'Disabled', 'Idle'])
	pgm.createType('order_status_type', ['Unpaid', 'Paid', 'Cancelled'])
	pgm.createType('order_detail_status_type', [
		'Pending',
		'Shipping',
		'Cancelled'
	])
}

exports.down = pgm => {}
