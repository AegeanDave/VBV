import ExcelJS from 'exceljs'

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
		{ header: '快递公司', key: 'carrier', width: 14 },
		{ header: '快递单号', key: 'trackingNumber', width: 18 }
	]

	const newSheetsList = data.reduce((acc: any, order: any, index: number) => {
		const { recipient, phone, street, city, state, country } = order.address
		const newColumn = {
			index: index + 1,
			orderNumber: order.orderNumber,
			address:
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

	const outputFile = 'shipment.xlsx'
	await workbook.xlsx.writeFile(outputFile)
	return outputFile
}

export { shipmentExcelRender }
