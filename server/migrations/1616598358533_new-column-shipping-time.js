/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addColumns('orderDetails', {
		shippingAt: {
			type: 'timestamp'
		}
	})
}

exports.down = pgm => {}
