import React from 'react'
import { ProductTable, ScreenDialog } from '../../components/index'
import { Add } from '@material-ui/icons'
import { Fab, AppBar, Tabs, Tab } from '@material-ui/core'
import { Product } from '../../models/index'
import { updateProductStatus, updateProductInfo } from '../../api/index'
import {
	SaleStatus,
	actions,
	snackMessage,
	productStatusTabs
} from '../../constant'
import { SnackBarProps } from '../../models/index'
import './style.scss'

interface Props {
	snackOpen: (snackInfo: SnackBarProps) => void
	openBackdrop: () => void
	closeBackdrop: () => void
	productList: Product[]
	setProductList: (products: Product[]) => void
}

const ProductList = ({
	snackOpen,
	closeBackdrop,
	openBackdrop,
	productList,
	setProductList
}: Props) => {
	const [currentProduct, setCurrentProduct] = React.useState<
		Product | undefined
	>()
	const [tabIndex, setTabIndex] = React.useState(0)
	const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
		setTabIndex(newValue)
	}
	const handleProductInfo = async (
		product: Product,
		action: string,
		uploadCoverImage?: File
	) => {
		let currentProducts = [...productList]
		openBackdrop()
		const result = await updateProductInfo(product, action, uploadCoverImage)
		if (result.status === 200) {
			if (action === actions.submit.key) {
				product = result.data
				product.status = SaleStatus.ENABLED
				currentProducts.unshift(product)
				snackOpen(snackMessage.success.submit)
			} else if (action === actions.edit.key) {
				currentProducts.forEach((item: Product, index: number) => {
					if (product.productId === item.productId) {
						currentProducts[index] = result.data
					}
				})
				snackOpen(snackMessage.success.edit)
			}
			setProductList(currentProducts)
		}
		closeBackdrop()
		handleClose()
	}
	const handleUpdateStatus = async (row: Product, action: string) => {
		let currentProducts = [...productList]
		const result = await updateProductStatus(row, action)
		if (result.status === 200) {
			if (action === actions.delete.key) {
				const newProductList = currentProducts.filter(
					(product: Product) => product.productId !== row.productId
				)
				setProductList(newProductList)
			} else if (action === actions.release.key) {
				currentProducts.forEach((product: Product) => {
					if (product.productId === row.productId)
						product.status = SaleStatus.ENABLED
				})
				setProductList(currentProducts)
			} else if (action === actions.unrelease.key) {
				currentProducts.forEach((product: Product) => {
					if (product.productId === row.productId)
						product.status = SaleStatus.IDLE
				})
				setProductList(currentProducts)
			}
			snackOpen(snackMessage.success.edit)
			handleClose()
		}
	}
	const [open, setOpen] = React.useState(false)

	const handleClickOpenToEdit = (product: Product) => {
		setCurrentProduct(product)
		setOpen(true)
	}
	const handleClickOpenToCreate = () => {
		setOpen(true)
	}
	const handleClose = () => {
		setOpen(false)
		setCurrentProduct(undefined)
	}
	const publishedProducts = productList.filter(
		(product: Product) => product.status === SaleStatus.ENABLED
	)
	const unpublishedProducts = productList.filter(
		(product: Product) => product.status !== SaleStatus.ENABLED
	)
	return (
		<div className='mainBox'>
			<AppBar position='static' color='default'>
				<Tabs
					value={tabIndex}
					onChange={handleChangeTab}
					variant='fullWidth'
					classes={{ indicator: 'indicator' }}
					aria-label='full width tabs example'
				>
					<Tab label='已上架产品' />
					<Tab label='未上架产品' />
				</Tabs>
			</AppBar>
			<div className='table'>
				{tabIndex === productStatusTabs.Published &&
					(publishedProducts.length === 0 ? (
						<div className='emptyTable'>
							<span>暂无已上架产品</span>
						</div>
					) : (
						<ProductTable
							clickOpen={handleClickOpenToEdit}
							products={publishedProducts}
							handleUpdateStatus={handleUpdateStatus}
						/>
					))}
				{tabIndex === productStatusTabs.Unpublished &&
					(unpublishedProducts.length === 0 ? (
						<div className='emptyTable'>
							<span>暂无未上架产品</span>
						</div>
					) : (
						<ProductTable
							clickOpen={handleClickOpenToEdit}
							products={unpublishedProducts}
							handleUpdateStatus={handleUpdateStatus}
						/>
					))}
			</div>
			<Fab
				aria-label='add'
				className='fab'
				size='large'
				onClick={() => handleClickOpenToCreate()}
			>
				<Add fontSize='large' style={{ color: 'fff' }} />
			</Fab>
			{!currentProduct ? (
				<ScreenDialog
					open={open}
					handleClose={handleClose}
					action={actions.submit.key}
					snackOpen={snackOpen}
					handleUpdateProductInfo={handleProductInfo}
				></ScreenDialog>
			) : (
				<ScreenDialog
					open={open}
					handleClose={handleClose}
					productInfo={currentProduct}
					action={actions.edit.key}
					handleUpdateProductInfo={handleProductInfo}
					snackOpen={snackOpen}
				></ScreenDialog>
			)}
		</div>
	)
}

export default ProductList
