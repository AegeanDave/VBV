/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.dropColumns('warehouses', ['countryCodeAdmin'])
	pgm.addColumns('warehouses', {
		countryCodeAdmin: { type: 'country_code' }
	})
}

exports.down = pgm => {}
