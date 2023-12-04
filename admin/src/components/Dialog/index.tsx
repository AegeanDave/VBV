import React from 'react'
import {
	IconButton,
	Typography,
	Dialog,
	AppBar,
	Toolbar,
	Slide,
	DialogContent
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { TransitionProps } from '@material-ui/core/transitions'
import ProductForm from '../NewProduct/index'
import { Product, SnackBarProps } from '../../models/index'
import './style.scss'

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children?: React.ReactElement },
	ref: React.Ref<unknown>
) {
	return <Slide direction='up' ref={ref} {...props} />
})
interface Props {
	open: boolean
	productInfo?: Product
	index?: number
	action: string
	handleClose: () => void
	handleUpdateProductInfo: (
		product: Product,
		action: string,
		uploadCoverImage?: File,
		uploadImage?: File[]
	) => void
	snackOpen: (snackInfo: SnackBarProps) => void
}
export default function ScreenDialog(props: Props) {
	return (
		<Dialog
			fullScreen
			open={props.open}
			onClose={props.handleClose}
			TransitionComponent={Transition}
			classes={{
				root: 'outerBox'
			}}
		>
			<AppBar position='sticky' className='appBar'>
				<Toolbar>
					<Typography variant='h6' className='title'>
						{props.productInfo ? '编辑' : '上传'}
					</Typography>
					<IconButton onClick={props.handleClose} className='cancel'>
						<CloseIcon />
					</IconButton>
				</Toolbar>
			</AppBar>
			<DialogContent>
				<ProductForm
					productInfo={props.productInfo}
					action={props.action}
					snackOpen={props.snackOpen}
					handleUpdateProductInfo={props.handleUpdateProductInfo}
				/>
			</DialogContent>
		</Dialog>
	)
}
