/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addColumns(
		'inStoreProducts',
		{
			serialId: { type: 'serial', notNull: true, unique: true }
		},
		{ ifNotExists: true }
	)
}

exports.down = pgm => {}
