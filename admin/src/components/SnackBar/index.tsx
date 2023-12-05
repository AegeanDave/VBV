// import React from 'react'
// import Snackbar from '@material-ui/core/Snackbar'
// import { SnackBarProps } from '../../models/index'
// import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'
// import './style.scss'

// function Alert(props: AlertProps) {
// 	return <MuiAlert variant='filled' {...props} />
// }

// interface Props {
// 	snackInfo: SnackBarProps
// 	open: boolean
// 	handleClose: () => void
// }
// export default function Snackbars({ snackInfo, open, handleClose }: Props) {
// 	return (
// 		<Snackbar
// 			open={open}
// 			classes={{ root: 'snackRoot', anchorOriginTopCenter: 'topCenter' }}
// 			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
// 			autoHideDuration={3000}
// 			onClose={handleClose}
// 		>
// 			<Alert
// 				onClose={handleClose}
// 				severity={snackInfo.type}
// 				className='snackContent'
// 			>
// 				{snackInfo.message}
// 			</Alert>
// 		</Snackbar>
// 	)
// }
