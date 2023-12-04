import React from 'react'
import logo from '../../assets/images/logo.png'
import {
	Avatar,
	Divider,
	Typography,
	ButtonGroup,
	Button,
	Drawer,
	CssBaseline,
	DialogContent
} from '@material-ui/core'
import Popup from '../Popup/index'
import { navigators } from '../../constant/index'
import { logout } from '../../api/index'
import { useHistory } from 'react-router-dom'
import './style.scss'

interface Props {
	orderBadge?: number
	handleOpenDialog: () => void
}

export default function PermanentDrawerLeft({
	handleOpenDialog,
	orderBadge
}: Props) {
	const history = useHistory()
	const [open, setOpen] = React.useState(false)
	const handleOpenPopup = () => {
		setOpen(true)
	}
	const handleClose = () => {
		setOpen(false)
	}
	const PopupContent = () => {
		return <DialogContent dividers>请联系 info@vbangv.com</DialogContent>
	}

	return (
		<>
			<CssBaseline />
			<Drawer
				className='drawer'
				variant='permanent'
				classes={{
					paper: 'drawerPaper'
				}}
				anchor='left'
			>
				<div className='sideBarHeader'>
					<Avatar alt='logo' src={logo} className='avatarLarge' />
					<Typography component='h5' className='title'>
						微帮微仓库管理系统
					</Typography>
				</div>
				<div className='btnGroupContainer'>
					<ButtonGroup
						orientation='vertical'
						color='primary'
						variant='text'
						className='btnGroupMenu'
						classes={{
							groupedVertical: 'groupedVertical'
						}}
					>
						<Button
							className={
								history.location.pathname === navigators.productList.path
									? 'selected navigatorbtn'
									: 'navigatorbtn'
							}
							href={navigators.productList.path}
						>
							{navigators.productList.label}
						</Button>
						<Button className='navigatorbtn upload' onClick={handleOpenDialog}>
							上传商品
						</Button>
						<Button
							className={
								history.location.pathname === navigators.order.path
									? 'selected navigatorbtn'
									: 'navigatorbtn'
							}
							href={navigators.order.path}
						>
							{navigators.order.label}
							{orderBadge !== 0 && <div className='badge'>{orderBadge}</div>}
						</Button>
						<Button
							className={
								history.location.pathname === navigators.history.path
									? 'selected navigatorbtn'
									: 'navigatorbtn'
							}
							href={navigators.history.path}
						>
							{navigators.history.label}
						</Button>
						<Button
							className={
								history.location.pathname === navigators.account.path
									? 'selected navigatorbtn'
									: 'navigatorbtn'
							}
							href={navigators.account.path}
						>
							{navigators.account.label}
						</Button>
						<Button
							className={
								history.location.pathname === navigators.setting.path
									? 'selected navigatorbtn'
									: 'navigatorbtn'
							}
							href={navigators.setting.path}
						>
							{navigators.setting.label}
						</Button>
					</ButtonGroup>
				</div>
				<div className='btnGroupBottom'>
					<Button onClick={handleOpenPopup}>联系客服</Button>
					<Divider
						orientation='vertical'
						flexItem
						classes={{ root: 'dividerVertical' }}
					/>
					<Button onClick={() => logout(history)}>退出登录</Button>
				</div>
			</Drawer>
			<Popup
				open={open}
				Content={PopupContent}
				title={'请扫描二维码联系客服'}
				needConfirm={false}
				handleClose={handleClose}
			/>
		</>
	)
}
