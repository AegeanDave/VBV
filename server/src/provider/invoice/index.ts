import fs from 'fs'
import puppeteer from 'puppeteer'
import path from 'path'
import ejs from 'ejs'

const shipmentDocRender = async (data: any) => {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	})
	const page = await browser.newPage()

	const outputPath = 'shipment.pdf'
	const template = fs.readFileSync(
		path.join(__dirname, 'template', 'shipment.ejs'),
		'utf-8'
	)
	// Render the template with data
	const renderedHtml = ejs.render(template, { data })
	// Create a PDF document
	await page.setContent(renderedHtml)
	await page.setViewport({ width: 842, height: 595 })
	// Embed the HTML content into the PDF
	const pdfBuffer = await page.pdf({
		path: 'shipment.pdf',
		format: 'A4',
		landscape: true
	})
	await page.close()
	await browser.close()
	return { pdfBuffer, outputPath }
}

export { shipmentDocRender }
