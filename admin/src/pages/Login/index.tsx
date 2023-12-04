import React from 'react'
import logo from '../../assets/images/logo.png'
import LoginForm from '../../components/LoginForm/index'
import { Avatar, Typography, Grid } from '@material-ui/core'
import './style.scss'

export default function Login(props: any) {
	const { snackOpen } = props
	return (
		<div className='formContainer'>
			<Grid container direction='column' justify='center' alignItems='center'>
				<Grid item xs>
					<Avatar alt='VBV' src={logo} className='avatar' />
				</Grid>
				<Grid item xs>
					<Typography className='title' variant='h5' component='h4'>
						微帮微商家仓库管理
					</Typography>
				</Grid>
				<Grid item xs className='inputForm'>
					<LoginForm snackOpen={snackOpen} />
				</Grid>
			</Grid>
		</div>
	)
}
