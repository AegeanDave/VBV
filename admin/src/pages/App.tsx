import React, { useEffect } from 'react'
import './App.css'
import PrivateRoute from '../pages/PrivateRoute/index'
import ReactGA from 'react-ga'
import Login from './Login/index'
import { loggedIn } from '../constant/index'
import { SnackBarProps } from '../models/index'
import SnackBar from '../components/SnackBar/index'
import { Switch, Route, Redirect } from 'react-router-dom'

function App() {
	const [open, setOpen] = React.useState(false)
	const [snackInfo, setSnackInfo] = React.useState<SnackBarProps>({
		type: 'success',
		message: ''
	})
	useEffect(() => {
		const GAID: any = process.env.REACT_APP_GA_ID
		ReactGA.initialize(GAID)
		// To Report Page View
		ReactGA.pageview(window.location.pathname + window.location.search)
	}, [])

	const handleOpenSnack = (snackInfo: SnackBarProps) => {
		setOpen(true)
		setSnackInfo(snackInfo)
	}
	const handleClose = () => {
		setOpen(false)
		setSnackInfo({
			type: 'success',
			message: ''
		})
	}
	return (
		<>
			<Switch>
				<Route
					path='/login'
					render={() => (
						<>
							{loggedIn() && <Redirect to='/' />}
							<Login snackOpen={handleOpenSnack} />
						</>
					)}
				></Route>
				<Route
					path='/reset'
					render={(props: any) => (
						<Login {...props} snackOpen={handleOpenSnack} />
					)}
				></Route>
				<Route
					path='/'
					render={() =>
						loggedIn() ? (
							<PrivateRoute snackOpen={handleOpenSnack} />
						) : (
							<Redirect to='/login' />
						)
					}
				></Route>
			</Switch>
			<SnackBar snackInfo={snackInfo} open={open} handleClose={handleClose} />
		</>
	)
}

export default App
