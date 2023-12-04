import React from 'react'
import {
	IconButton,
	Button,
	TextField,
	MenuItem,
	Menu
} from '@material-ui/core'
import { Order } from '../../models/index'
import { actions, OrderStatus, carriers } from '../../constant/index'
import { Edit, ExpandMore } from '@material-ui/icons'
import './style.scss'

interface Props {
	order: Order
	updateOrder: (order: Order, action: string) => void
}
export default function ShippingAction({ order, updateOrder }: Props) {
	const orderInfo = order

	const [trackingNumber, setTrackingNumber] = React.useState(
		!order.trackingNumber || order.trackingNumber === OrderStatus.PENDING
			? ''
			: order.trackingNumber
	)
	const [isEditing, setIsEditing] = React.useState(true)
	const [company, setCompany] = React.useState(
		!order.company || order.company === OrderStatus.PENDING
			? { key: 'all', label: '快递公司' }
			: carriers[order.company]
	)
	const handleEdit = () => {
		setIsEditing(false)
	}
	const handleReject = () => {
		updateOrder(orderInfo, actions.reject.key)
	}
	const handleShipping = (input: string) => {
		let currentOrderInfo = { ...orderInfo }
		currentOrderInfo.company = company.key
		currentOrderInfo.trackingNumber = input
		updateOrder(currentOrderInfo, actions.ship.key)
	}
	const submitEditedOrder = (input: string) => {
		let currentOrderInfo = { ...orderInfo }
		currentOrderInfo.company = company.key
		currentOrderInfo.trackingNumber = input
		updateOrder(currentOrderInfo, actions.edit.key)
		setIsEditing(true)
	}
	const TrackingInfoRender = ({ disabled }: any) => {
		const [
			anchorCompany,
			setAnchorCompany
		] = React.useState<null | HTMLElement>(null)
		const handleCompanySelect = (value: any) => {
			setCompany(value)
			setAnchorCompany(null)
		}
		return (
			<>
				<div>
					<Button
						aria-controls='company'
						onClick={e => setAnchorCompany(e.currentTarget)}
						disabled={disabled}
						aria-haspopup='true'
						endIcon={<ExpandMore></ExpandMore>}
					>
						{company.label}
					</Button>
					<Menu
						id='status'
						anchorEl={anchorCompany}
						keepMounted
						open={Boolean(anchorCompany)}
						getContentAnchorEl={null}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center'
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'center'
						}}
						onClose={() => setAnchorCompany(null)}
					>
						{Object.values(carriers).map((carrier: any) => (
							<MenuItem
								key={carrier.key}
								onClick={(e: React.ChangeEvent<any>) =>
									handleCompanySelect(carrier)
								}
							>
								{carrier.label}
							</MenuItem>
						))}
					</Menu>
				</div>
				<TextField
					disabled={disabled}
					name='trackingNumber'
					autoFocus
					InputProps={{
						className: 'input'
					}}
					placeholder='输入快递单号'
					variant='outlined'
					size='small'
					value={trackingNumber}
					className='trackingNumber'
					onChange={(e: React.ChangeEvent<any>) =>
						setTrackingNumber(e.target.value)
					}
				/>
			</>
		)
	}
	return order.status === OrderStatus.PAID &&
		order.trackingStatus === OrderStatus.PENDING ? (
		<div className='shippingBox current'>
			<div className='vertical'>
				<TrackingInfoRender
					disable={false}
					trackingNumber={trackingNumber}
					company={company}
				/>
			</div>
			<div className='actionField'>
				<Button className='reforce' onClick={() => handleReject()}>
					驳回订单
				</Button>
				<Button
					className='btn submit'
					disabled={company.key === 'all' || !trackingNumber}
					onClick={() => handleShipping(trackingNumber)}
				>
					确认发货
				</Button>
			</div>
		</div>
	) : order.trackingStatus === OrderStatus.CANCELLED ? (
		<div className='shippingBox history'>
			<span className='reject'>订单被驳回</span>
		</div>
	) : (
		<div className='shippingBox history'>
			<div className='edit horizontal'>
				<TrackingInfoRender
					disabled={isEditing}
					comany={company}
					trackingNumber={trackingNumber}
				/>
				<IconButton aria-label='edit' size='medium' onClick={handleEdit}>
					<Edit fontSize='inherit' />
				</IconButton>
			</div>
			{!isEditing && (
				<div className='actionField'>
					<Button
						className='btn submit'
						disabled={company.key === 'all' || !trackingNumber}
						onClick={() => submitEditedOrder(trackingNumber)}
					>
						确认修改
					</Button>
				</div>
			)}
		</div>
	)
}
