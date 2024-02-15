import fs from 'fs'
import puppeteer from 'puppeteer'
import path from 'path'
import ejs from 'ejs'

const posterRender = async (data: any) => {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	})
	const page = await browser.newPage()

	const template = fs.readFileSync(
		path.join(__dirname, 'template', 'product.ejs'),
		'utf-8'
	)
	// Render the template with data
	const renderedHtml = ejs.render(template, data)
	await page.setContent(renderedHtml)
	await page.setViewport({ width: 900, height: 1700, deviceScaleFactor: 2 })
	const content = await page.$('body')
	const imageBuffer = await content?.screenshot({
		omitBackground: true
	})
	await page.close()
	await browser.close()
	return imageBuffer
}

export { posterRender }
