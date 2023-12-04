exports.shorthands = undefined

exports.up = pgm => {
	pgm.createType('country_code', ['CA', 'US', 'CN'])
}

exports.down = pgm => {}
