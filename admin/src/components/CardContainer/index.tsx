import React from 'react'
import { Product, Order } from '../../models/index'
import OrderCard from '../OrderCard/index'
import SearchBar from '../SearchBar/index'
import './style.scss'
import moment from 'moment'

interface Props {
	orderList: Order[]
	searchBar?: boolean
	updateOrder: (order: Order, action: string) => void
	handleCopy: () => void
}
export default function CardContainer({
	orderList,
	searchBar,
	updateOrder,
	handleCopy
}: Props) {
	const [searchOrders, setSearchOrders] = React.useState<Order[]>([])
	const [time, setTime] = React.useState('时间')
	const [status, setStatus] = React.useState('ALL')
	const [searchInput, setSearchInput] = React.useState('')
	const [onSearch, setOnSearch] = React.useState(false)

	const findProduct = (orders: Order, value: string) => {
		const productSearchResult = orders.orderProducts.find((product: Product) =>
			product.productName.toLowerCase().includes(value)
		)
		if (productSearchResult) {
			return true
		}
		return false
	}
	const handleSearch = (event: React.ChangeEvent<any>) => {
		if (event.target.value) {
			const input = event.target.value.toLowerCase()
			setOnSearch(true)
			setTime('时间')
			setStatus('ALL')
			const searchResult = orderList.filter(
				(order: Order) =>
					order.orderNumber.toLowerCase().includes(input) ||
					order.buyer.name.toLowerCase().includes(input) ||
					(order.trackingNumber &&
						order.trackingNumber.toLowerCase().includes(input)) ||
					findProduct(order, input)
			)
			setSearchOrders(searchResult)
			setSearchInput(event.target.value)
		} else {
			setOnSearch(false)
			setSearchInput('')
		}
	}
	const handleTimeFilter = (option: string) => {
		if (option === 'time') {
			setTime('时间')
			if (status === 'ALL' && !searchInput) setOnSearch(false)
		} else {
			setOnSearch(true)
			setStatus('ALL')
			const searchResult = orderList.filter((order: Order) =>
				moment(order.createdAt).isSame(option, 'month')
			)
			setSearchOrders(searchResult)
			setTime(option)
		}
	}
	const handleStatusFilter = (option: string) => {
		if (option === 'ALL') {
			if (time === '时间' && !searchInput) setOnSearch(false)
		} else {
			setOnSearch(true)
			setTime('时间')
			const searchResult = orderList.filter(
				(order: Order) => order.trackingStatus === option
			)
			setSearchOrders(searchResult)
		}
		setStatus(option)
	}
	const groupOptions = () => {
		const timeOptions: string[] = []
		const statusOptions: string[] = []
		orderList.forEach(order => {
			const formateTime = moment(order.createdAt).format('YYYY MMMM')
			if (!timeOptions.includes(formateTime)) {
				timeOptions.push(formateTime)
			}
			if (!statusOptions.includes(order.trackingStatus)) {
				statusOptions.push(order.trackingStatus)
			}
		})
		return {
			timeOptions: timeOptions,
			statusOptions: statusOptions
		}
	}
	const options = groupOptions()
	const showOrder = onSearch ? searchOrders : orderList
	return (
		<div className='main'>
			{searchBar && (
				<SearchBar
					search={handleSearch}
					time={time}
					handleStatusFilter={handleStatusFilter}
					handleTimeFilter={handleTimeFilter}
					status={status}
					options={options}
					disabled={orderList.length === 0}
				/>
			)}
			<div className='orderList'>
				<>
					<div className='columnLeft'>
						{showOrder.map(
							(order: Order, index: number) =>
								index % 2 === 0 && (
									<OrderCard
										key={order.orderId}
										order={order}
										updateOrder={updateOrder}
										handleCopy={handleCopy}
									/>
								)
						)}
					</div>
					<div className='columnRight'>
						{showOrder.map(
							(order: Order, index: number) =>
								index % 2 === 1 && (
									<OrderCard
										key={order.orderId}
										order={order}
										updateOrder={updateOrder}
										handleCopy={handleCopy}
									/>
								)
						)}
					</div>
				</>
			</div>
		</div>
	)
}
