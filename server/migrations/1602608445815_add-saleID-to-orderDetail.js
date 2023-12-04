/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addColumns(
		'orderDetails',
		{
			saleId: {
				type: 'uuid',
				references: '"inStoreProducts"'
			}
		},
		{ ifNotExists: true }
	)
}

exports.down = pgm => {}
