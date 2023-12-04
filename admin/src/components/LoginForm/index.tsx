import React from 'react'
import { useHistory } from 'react-router-dom'
import { login, getVerificationCode } from '../../api/index'
import { snackMessage, countryCodes, Status } from '../../constant/index'
import { SnackBarProps } from '../../models/index'
import {
	TextField,
	Button,
	Paper,
	MenuItem,
	FormControl,
	InputLabel,
	Select
} from '@material-ui/core'
import './style.scss'

interface Props {
	snackOpen: (snackInfo: SnackBarProps) => void
}

export default function LoginForm({ snackOpen }: Props) {
	const history = useHistory()
	const [isSend, setIsSend] = React.useState(false)
	const [countryCode, setCountryCode] = React.useState(countryCodes.CN)
	const [phone, setPhone] = React.useState('')
	const [verificationCode, setVerificationCode] = React.useState('')
	const [phoneError, setPhoneError] = React.useState(false)
	const [codeError, setCodeError] = React.useState(false)
	const [clock, setClock] = React.useState(59)
	const [isSmsSending, setIsSmsSending] = React.useState(false)

	const handleSubmitPhone = async (event: any) => {
		event.preventDefault()
		setIsSmsSending(true)
		clock !== 0 && handleCounting()
		try {
			const result = await getVerificationCode({
				tel: phone,
				countryCode: countryCode.key
			})
			if (result.data.status === Status.SUCCESS) {
				setIsSend(true)
			} else {
				setPhoneError(true)
				setIsSmsSending(false)
				setClock(59)
			}
		} catch (error) {
			setPhoneError(true)
			setIsSmsSending(false)
			setClock(59)
		}
	}
	const handleCounting = () => {
		let currentTime = clock
		let siv = setInterval(() => {
			setClock(currentTime--)
			if (currentTime <= -1) {
				clearInterval(siv)
				setClock(59)
				setIsSmsSending(false)
			}
		}, 1000)
	}
	const handleLogin = async (event: any) => {
		event.preventDefault()
		try {
			await login({
				verificationCode: verificationCode,
				entirePhoneNumber: countryCode.value + phone
			})
			history.push('/')
			snackOpen(snackMessage.success.verify)
		} catch (error) {
			setCodeError(true)
		}
	}
	const loginField = () => {
		return (
			<form onSubmit={handleSubmitPhone}>
				<FormControl className='countryCode'>
					<InputLabel id='countryCodeLabel'>区号</InputLabel>
					<Select
						id='countryCode'
						value={countryCode}
						error={phoneError}
						renderValue={() => '+ ' + countryCode.value}
						onChange={(e: React.ChangeEvent<{ value: any }>) =>
							setCountryCode(countryCodes[e.target.value])
						}
					>
						{Object.values(countryCodes).map((countryCode: any) => (
							<MenuItem value={countryCode.key} key={countryCode.key}>
								+ {countryCode.value} {countryCode.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<TextField
					required
					error={phoneError}
					id='phone'
					value={phone}
					label='手机号码'
					margin='normal'
					size='small'
					fullWidth
					helperText={phoneError ? '此手机号并未绑定仓库' : ''}
					onChange={e => setPhone(e.target.value)}
				/>
				<Button
					type='submit'
					variant='contained'
					disabled={phone && !isSmsSending ? false : true}
					className='btn'
				>
					{isSmsSending ? '发送验证码' + clock : '发送验证码'}
				</Button>
			</form>
		)
	}

	const verficationField = () => {
		return (
			<form onSubmit={handleLogin}>
				<p className='context'>
					手机号码：+{countryCode.value} {phone}
				</p>
				<TextField
					required
					error={codeError}
					id='verificationCode'
					label='验证码'
					margin='normal'
					value={verificationCode}
					size='small'
					helperText={codeError ? '验证码有误' : ''}
					onChange={e => setVerificationCode(e.target.value)}
				/>
				<div className='hint'>
					<span>没收到验证码？</span>
					<Button
						className='resend'
						size='small'
						onClick={() => setIsSend(false)}
					>
						重新发送
					</Button>
				</div>
				<Button
					type='submit'
					variant='contained'
					disabled={verficationField ? false : true}
					className='btn'
				>
					完成
				</Button>
			</form>
		)
	}
	return (
		<Paper className='container'>
			<span className='subtitle'>登录</span>
			{isSend ? verficationField() : loginField()}
		</Paper>
	)
}
