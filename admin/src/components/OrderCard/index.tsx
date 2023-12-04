import React from 'react'
import { Paper, Grid, Typography, IconButton } from '@material-ui/core'
import { Product, Order } from '../../models/index'
import CopyToClipboard from 'react-copy-to-clipboard'
import { OrderStatus } from '../../constant/index'
import { FileCopy, GetApp } from '@material-ui/icons'
import './style.scss'
import ActionField from './ActionField'
import { download } from '../../api/index'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import moment from 'moment'

interface OrderProps {
	order: Order
	updateOrder: (order: Order, action: string) => void
	handleCopy: () => void
}

export default function OrderCard({
	order,
	updateOrder,
	handleCopy
}: OrderProps) {
	const handleDownload = (urls: string[]) => {
		const zip = new JSZip()
		Promise.all(urls.map(url => download(url))).then(values => {
			values.forEach((buffer: any, index: number) => {
				zip.file(`images/${index}.jpg`, buffer.data)
			})
			zip.generateAsync({ type: 'blob' }).then((blob: any) => {
				saveAs(blob, 'images.zip')
			})
		})
	}
	const ifCredential = order.orderProducts.find(
		product => product.idCardRequired
	)
	return (
		<Paper className='cardContainer'>
			<div className='header'>
				<span>来自：{order.buyer.name}</span>
				<span>
					下单时间：
					{moment(order.createdAt).format('MMMM Do YYYY, h:mm a')}
				</span>
				<span>订单号：{order.orderNumber}</span>
			</div>
			<div className='productList'>
				{order.orderProducts.map((product: Product, index: number) => (
					<Grid container spacing={2} key={index}>
						<Grid item>
							<img
								className='img'
								alt={product.productName}
								src={product.coverImageURL}
							/>
						</Grid>
						<Grid item xs container direction='column' spacing={2}>
							<Grid item xs>
								<Typography variant='body2' gutterBottom>
									{product.productName}
								</Typography>
							</Grid>
							<Grid item>
								<Typography variant='body2'>单价：{product.price}</Typography>
								<Typography variant='body2'>
									数量：{product.quantity}
								</Typography>
							</Grid>
						</Grid>
					</Grid>
				))}
			</div>
			<div className='addressBox'>
				<div>
					<span>收货地址</span>
					{order.status === OrderStatus.PAID && (
						<CopyToClipboard
							text={
								order.address.quickInputAddress ||
								order.address.name +
									' ' +
									order.address.phone +
									' ' +
									order.address.province +
									' ' +
									order.address.city +
									' ' +
									order.address.street
							}
						>
							<IconButton
								aria-label='copy'
								size='small'
								className='copyIcon'
								disabled={
									!(
										order.address.name ||
										order.address.phone ||
										order.address.province ||
										order.address.city ||
										order.address.quickInputAddress
									)
								}
								onClick={handleCopy}
							>
								<FileCopy fontSize='inherit' />
							</IconButton>
						</CopyToClipboard>
					)}
				</div>
				{order.address.quickInputAddress ? (
					<span className='content'>{order.address.quickInputAddress}</span>
				) : (
					<>
						<span className='content'>
							{order.address.name} {order.address.phone}
						</span>
						<span>
							{order.address.province} {order.address.city}{' '}
							{order.address.street}
						</span>
					</>
				)}
			</div>
			{order.address.idFrontImage && order.address.idBackImage && ifCredential && (
				<div className='IDimagesBox'>
					<div>
						<span>身份信息</span>
						<IconButton
							aria-label='add an alarm'
							size='small'
							className='download'
							onClick={() =>
								handleDownload([
									order.address.idFrontImage as string,
									order.address.idBackImage as string
								])
							}
						>
							<GetApp fontSize='inherit' />
						</IconButton>
					</div>

					<div className='imges'>
						<img src={order.address.idFrontImage} alt='front'></img>
						<img src={order.address.idBackImage} alt='back'></img>
					</div>
				</div>
			)}
			<ActionField order={order} updateOrder={updateOrder} />
		</Paper>
	)
}
