import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: process.env.MAILER_HOST
		? process.env.MAILER_HOST
		: 'smtp.ethereal.email',
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.MAILER_USER, // generated ethereal user
		pass: process.env.MAILER_PASSWORD // generated ethereal password
	}
})

const registerMail = async (
	toEmail: string,
	token: string,
	toReset: boolean
) => {
	return await transporter.sendMail({
		from: 'admin@zmley.com', // sender address
		to: toEmail, // list of receivers
		subject: toReset ? '密码重置' : '微帮微仓库验证', // Subject line
		html: `<div style="display:flex; min-width: 300px; max-width: 600px; height: 100%; flex-direction:column; align-items:center; background-color:#FAFAFA; margin:0 auto;">
			<img src="https://vbangv-src.s3.us-east-2.amazonaws.com/asset/logo.png" style="width: 68px; margin: 40px; height:68px;" />
			<p style="margin-bottom:90px; margin-top:20px ;">
			${
				toReset
					? '点击链接，重置微帮微pro仓库端密码'
					: '感谢注册微帮微仓库管理，只需完成最后一步即可成为我们的仓库管理者'
			}
			</p>
			<a href="
			${(toReset ? process.env.RESET_URL : process.env.REGISTER_URL) +
				'?token=' +
				token +
				'&email=' +
				toEmail}" style="color:white; text-decoration: none;"><button style="padding: 10px 60px; color:white; background-color:#4CB0AB; margin:40px; border:none; border-radius:10px;">
			${toReset ? '重置密码' : '点我完成注册'}
			</button></a>
			</div>`
	})
}

const newOrderMail = async (
	toEmail: string,
	createdAt: string,
	name: string
) => {
	return await transporter.sendMail({
		from: 'admin@zmley.com', // sender address
		to: toEmail, // list of receivers
		subject: '新订单提醒', // Subject line
		html: `<div style="display:flex; min-width: 300px; max-width: 600px; height: 100%; flex-direction:column; align-items:center; background-color:#FAFAFA; margin:0 auto;">
			<img src="https://vbangv-src.s3.us-east-2.amazonaws.com/asset/logo.png" style="width: 68px; margin: 40px; height:68px; " />
			<p style="margin-bottom:30px; margin-top:20px; font-size:16px; color:#DA6F16; ">
			尊敬的微帮微用户，您的仓库收到新订单啦！
			</p>
			<p style="margin-bottom:10px; color: #000000; font-family: PingFang SC; font-size: 12px; ">
			下单时间：${createdAt}
			</p>
			<p style="margin-bottom:80px; color: #000000; font-family: PingFang SC; font-size: 12px;">
			下单用户：${name}
			</p>
			<a href="
			${process.env.ORDER_URL}" style="color:#0BA29A; ">
			去处理新订单
			</a>
			</div>` // html body
	})
}

export { registerMail, newOrderMail }
