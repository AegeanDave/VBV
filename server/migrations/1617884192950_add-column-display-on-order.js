/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addColumns('orders', {
		active: {
			type: 'boolean',
			notNull: true,
			default: true
		}
	})
}

exports.down = pgm => {}
