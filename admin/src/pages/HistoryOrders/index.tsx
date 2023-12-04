import React from 'react'
import { Order } from '../../models/index'
import OrderContainer from '../../components/CardContainer'

interface Props {
	orders: Order[]
	updateOrder: (order: Order, action: string) => void
	handleCopy: () => void
}
const OrdersHistory = ({ orders, updateOrder, handleCopy }: Props) => {
	return (
		<OrderContainer
			orderList={orders}
			searchBar={true}
			updateOrder={updateOrder}
			handleCopy={handleCopy}
		/>
	)
}
export default OrdersHistory
