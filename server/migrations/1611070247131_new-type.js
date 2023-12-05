exports.shorthands = undefined

exports.up = pgm => {
	pgm.createType('country_code', ['CA', 'US', 'CN'])
}

exports.up = pgm => {
	pgm.createType('warehouse_status', ['Active', 'NotVerified', 'Inactive'])
}
