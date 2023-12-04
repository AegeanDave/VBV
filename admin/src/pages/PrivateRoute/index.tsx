import React, { useEffect } from 'react'
import './style.scss'
import { Backdrop, CircularProgress } from '@material-ui/core'
import {
	navigators,
	OrderStatus,
	SaleStatus,
	actions,
	snackMessage
} from '../../constant/index'
import Orders from '../CurrentOrders/index'
import OrdersHistory from '../HistoryOrders/index'
import { Navigator, ScreenDialog } from '../../components'
import ProductList from '../ProductList/index'
import Account from '../Account/index'
import Setting from '../Setting/index'
import { Order, Product, SnackBarProps } from '../../models/index'
import {
	getOrders,
	updateOrder,
	updateProductInfo,
	getProducts
} from '../../api/index'
import { Switch, Route } from 'react-router-dom'

interface Props {
	snackOpen: (snackInfo: SnackBarProps) => void
}
export default function PrivateRoute({ snackOpen }: Props) {
	const [orders, setOrders] = React.useState<Order[]>([])
	const [products, setProducts] = React.useState<Product[]>([])
	const [openBackdrop, setOpenBackdrop] = React.useState(false)
	useEffect(() => {
		const loading = async () => {
			let result
			result = await getOrders()
			setOrders(result.data)
			result = await getProducts()
			setProducts(result.data)
		}
		loading()
	}, [])
	const currentOrders = orders.filter(
		(order: Order) =>
			order.status === 'Paid' && order.trackingStatus === OrderStatus.PENDING
	)
	const historyOrders = orders.filter(
		order =>
			order.status === 'Paid' && order.trackingStatus !== OrderStatus.PENDING
	)
	const handleCopy = () => {
		snackOpen(snackMessage.success.copy)
	}
	const handleUpdateOrder = async (order: Order, action: string) => {
		const result = await updateOrder(order, action)
		if (result.status === 200) {
			let updatingOrders = [...orders]
			updatingOrders.forEach(currentOrder => {
				if (
					currentOrder.orderId === order.orderId &&
					action === actions.reject.key
				) {
					currentOrder.trackingStatus = 'Canceled'
					snackOpen(snackMessage.success.reject)
				} else if (
					currentOrder.orderId === order.orderId &&
					action === actions.ship.key
				) {
					currentOrder.company = order.company
					currentOrder.trackingNumber = order.trackingNumber
					currentOrder.trackingStatus = 'Shipping'
					snackOpen(snackMessage.success.submit)
				} else if (
					currentOrder.orderId === order.orderId &&
					action === actions.edit.key
				) {
					currentOrder = order
					snackOpen(snackMessage.success.edit)
				}
			})
			setOrders(updatingOrders)
		} else {
			snackOpen(snackMessage.error.submit)
		}
	}
	const [openDialog, setOpenDialog] = React.useState(false)
	const handleCloseDialog = () => {
		setOpenDialog(false)
	}
	const handleProductInfo = async (
		product: Product,
		action: string,
		uploadCoverImage?: File,
		uploadImages?: File[]
	) => {
		setOpenBackdrop(!openBackdrop)
		const result = await updateProductInfo(product, action, uploadCoverImage)
		if (result.status === 200) {
			const currentProducts = [...products]
			product = result.data
			product.status = SaleStatus.ENABLED
			currentProducts.unshift(product)
			setProducts(currentProducts)
			handleCloseDialog()
		}
		snackOpen(snackMessage.success.submit)
		setOpenBackdrop(false)
	}
	return (
		<div className='root'>
			<Navigator
				handleOpenDialog={() => setOpenDialog(true)}
				orderBadge={currentOrders.length}
			/>
			<Switch>
				<Route
					exact
					path={navigators.productList.path}
					render={() => (
						<ProductList
							snackOpen={snackOpen}
							openBackdrop={() => setOpenBackdrop(true)}
							closeBackdrop={() => setOpenBackdrop(false)}
							productList={products}
							setProductList={setProducts}
						/>
					)}
				></Route>
				<Route
					exact
					path={navigators.order.path}
					render={() => (
						<Orders
							orders={currentOrders}
							updateOrder={handleUpdateOrder}
							handleCopy={handleCopy}
						/>
					)}
				></Route>
				<Route
					exact
					path={navigators.setting.path}
					render={() => (
						<Setting
							snackOpen={snackOpen}
							openBackdrop={() => setOpenBackdrop(true)}
							closeBackdrop={() => setOpenBackdrop(false)}
						/>
					)}
				></Route>
				<Route
					path={navigators.history.path}
					render={() => (
						<OrdersHistory
							orders={historyOrders}
							updateOrder={handleUpdateOrder}
							handleCopy={handleCopy}
						/>
					)}
				></Route>
				<Route
					path={navigators.account.path}
					render={() => <Account />}
				></Route>
			</Switch>
			<ScreenDialog
				open={openDialog}
				handleClose={handleCloseDialog}
				action={actions.submit.key}
				snackOpen={snackOpen}
				handleUpdateProductInfo={handleProductInfo}
			></ScreenDialog>
			<Backdrop className='backdrop' open={openBackdrop}>
				<CircularProgress color='inherit' />
			</Backdrop>
		</div>
	)
}
