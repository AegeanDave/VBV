const ncp = require('ncp')
const path = require('path')

// Source directory containing EJS files
const ejsSourceDirectory = path.join(
	__dirname,
	'src',
	'provider',
	'invoice',
	'template'
)

// Destination directory (dist) where EJS files will be copied
const distDirectory = path.join(
	__dirname,
	'dist',
	'provider',
	'invoice',
	'template'
)

// Copy EJS files to dist
ncp(ejsSourceDirectory, distDirectory, function (err) {
	if (err) {
		return console.error(err)
	}
	console.log('EJS files copied to dist.')
})
