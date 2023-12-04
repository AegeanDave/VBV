/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
	pgm.addConstraint('connections', 'alias_connection_key', {
		unique: ['openId', 'openIdChild']
	})

	pgm.addConstraint('prices', 'price_in_store_product_key', {
		unique: ['openIdChild', 'inStoreProductId']
	})
}

exports.down = pgm => {}
