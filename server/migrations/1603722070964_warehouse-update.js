/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addColumns(
		'warehouses',
		{
			countryCodeAdmin: {
				type: 'varchar(3)'
			},
			phoneAdmin: {
				type: 'varchar(11)'
			}
		},
		{ ifNotExists: true }
	)
}

exports.down = pgm => {}
