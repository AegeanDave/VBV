/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addColumns(
		'orderDetails',
		{
			createdAt: {
				type: 'timestamp',
				default: pgm.func('current_timestamp')
			},
			lastUpdatedAt: {
				type: 'timestamp',
				default: pgm.func('current_timestamp')
			}
		},
		{ ifNotExists: true }
	)
}

exports.down = pgm => {}
