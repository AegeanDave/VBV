import ExcelJS, { Cell } from 'exceljs'

const shipmentExcelRender = async (data: any) => {
	// Create a workbook and add a worksheet
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('出货单 1', {
		pageSetup: { paperSize: 9, orientation: 'landscape' }
	})

	worksheet.columns = [
		{ header: '序号', key: 'index', width: 5 },
		{ header: '订单号', key: 'orderNumber', width: 15 },
		{ header: '收件人地址', key: 'address', width: 35 },
		{ header: '产品名称', key: 'name', width: 18 },
		{ header: '数量', key: 'quantity', width: 5 },
		{ header: '快递公司', key: 'carrier', width: 10 },
		{ header: '快递单号', key: 'trackingNumber', width: 18 },
		{ header: '备注', key: 'comment', width: 20 }
	]

	const newSheetsList = data.reduce((acc: any, order: any, index: number) => {
		const { recipient, phone, street, city, state, country, quickInput } =
			order.address
		const newColumn = {
			index: index + 1,
			orderNumber: order.orderNumber,
			address:
				quickInput ||
				recipient +
					' ' +
					phone +
					' ' +
					street +
					' ' +
					city +
					' ' +
					state +
					' ' +
					country
		}
		const items = order.orderDetails.map((item: any, index: number) => {
			if (index === 0) {
				return {
					...newColumn,
					name: item.productInfo.name,
					quantity: item.quantity
				}
			}
			return { name: item.productInfo.name, quantity: item.quantity }
		})
		return acc.concat(items)
	}, [])

	worksheet.addRows(newSheetsList)
	const totalRows = worksheet.rowCount
	worksheet.columns.forEach((column: any) => {
		if (column.number > 5) return
		let startRow = 2
		let prevCellValue: any = null
		column.eachCell({ includeEmpty: true }, (cell: Cell, rowNumber: number) => {
			if (cell.value === null) {
				if (prevCellValue !== null) {
					startRow = rowNumber - 1
				}
				// If the current cell is empty, check the next cell
				const nextCell = worksheet.getCell(`${column.letter}${rowNumber + 1}`)
				if (nextCell && nextCell.value === null && rowNumber !== totalRows) {
					// If the next cell is also empty, continue checking
					prevCellValue = cell.value
					return
				}
				// Merge cells if the next cell is not empty
				worksheet.mergeCells(
					`${column.letter}${startRow}:${column.letter}${rowNumber}`
				)
			}
			cell.alignment = { vertical: 'top' }
			prevCellValue = cell.value
		})
	})

	worksheet.pageSetup.margins = {
		left: 0.25,
		right: 0.25,
		top: 0.5,
		bottom: 0.5,
		header: 0.3,
		footer: 0.3
	}
	const outputFile = 'shipment.xlsx'
	await workbook.xlsx.writeFile(outputFile)
	return outputFile
}

export { shipmentExcelRender }
