import { Router, Request, Response } from 'express'
import { myCache } from '../../../provider/cache'
const route = Router()
import { query, Logger } from '../../../services'
import { login, makeCode, getQRcode } from '../../../provider'
import { isAuthenticated, myOpenId } from '../../middleware/authorization'
import { queryName } from '../../../services/queryName'
import { upload } from '../../../provider/fileAction'
import { Status, Image, AliasStatus, addressField } from '../../../constants'
import { disableWholeProductLine } from './product'

export default (app: Router) => {
	app.use('/users', route)

	route.post('/login', async (req: Request, res: Response) => {
		const code = req.body.code
		const result = await login(code)
		console.log(result)
		if (!result.data) {
			res.send({ success: false, message: 'Login fail' })
			return
		}
		query(queryName.login, [result.data.openid])
		myCache.set(result.data.session_key, result.data.openid, 10000)
		res.send(result.data)
		Logger.info('Login Success')
	})
	route.post(
		'/updateUserInfo',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { nickName, avatarUrl } = req.body
			const result = await query(queryName.updateUserInfo, [
				nickName,
				avatarUrl,
				myOpenId
			])
			res.send(result)
			Logger.info('Upload Success')
		}
	)
	route.get(
		'/fatherAndChildNumber',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryResultChild = await query(queryName.getChildrenNumber, [
				myOpenId
			])
			const queryResultFather = await query(queryName.getFatherNumber, [
				myOpenId
			])
			res.send({
				fatherNumber: queryResultFather.data[0],
				childNumber: queryResultChild.data[0]
			})
			Logger.info('Father and children #get')
		}
	)
	route.get(
		'/basicInfo',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryArray = [
				query(queryName.getAllChildren, [myOpenId]),
				query(queryName.getAllFathers, [myOpenId]),
				query(queryName.checkWarehouse, [myOpenId])
			]

			Promise.all(queryArray)
				.then(value => {
					const userInfo = {
						childNumber: value[0].count,
						childrenList: value[0].data,
						fatherNumber: value[1].count,
						fathersList: value[1].data,
						warehouse: value[2].data
					}
					res.send({
						status: Status.SUCCESS,
						data: userInfo
					})
					Logger.info('user basic info #get')
				})
				.catch(err => {
					res.send({
						status: Status.FAIL,
						message: err
					})
				})
		}
	)
	route.get(
		'/allChildren',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryResult = await query(queryName.getAllChildren, [myOpenId])
			res.send({ status: Status.SUCCESS, data: queryResult.data })
			Logger.info('all children get')
		}
	)
	route.get(
		'/allFathers',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryResult = await query(queryName.getAllFathers, [myOpenId])
			res.send({ status: Status.SUCCESS, data: queryResult.data })
			Logger.info('all fathers get')
		}
	)
	route.post(
		'/newRelationship',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const code = req.body.code
			const findFather = await query(queryName.findOpenIdAndCode, [code])
			if (findFather.data.length === 0) {
				res.send({
					status: Status.FAIL,
					messege: '邀请码有误'
				})
			} else if (findFather.data[0].openId === myOpenId) {
				res.send({
					status: Status.FAIL,
					messege: '不能关注自己'
				})
			} else if (findFather.data[0].status === AliasStatus.DISABLED) {
				res.send({
					status: Status.FAIL,
					messege: '邀请码已被使用'
				})
			} else {
				const queryResult = await query(queryName.createOrUpdateAlias, [
					findFather.data[0].openId,
					myOpenId
				])
				if (
					queryResult.data[0] &&
					queryResult.data[0].openId === findFather.data[0].openId
				) {
					const openIDFather = queryResult.data[0].openId
					query(queryName.usedCode, [code, openIDFather])
					res.send({
						status: Status.SUCCESS
					})
					Logger.info('success')
				} else {
					res.send({
						status: Status.FAIL,
						message: '关注失败'
					})
					Logger.info('failed')
				}
			}
		}
	)
	route.get(
		'/getAddress',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryResult = await query(queryName.allAddress, [myOpenId])
			res.send(queryResult.data)
			Logger.info('address loaded success')
		}
	)
	route.get(
		'/getAddressById',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const id = req.query.id
			const queryResult = await query(queryName.getAddressByID, [id as string])
			res.send(queryResult.data[0])
			Logger.info('address loaded success')
		}
	)
	route.post(
		'/newAddress',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { address, selectedField } = req.body
			try {
				let queryResult
				if (selectedField === addressField.NORMALFORM) {
					queryResult = await query(queryName.addAddressWithoutFile, [
						myOpenId,
						address.street,
						address.city,
						address.province,
						'中国',
						address.name,
						address.phone
					])
				} else if (selectedField === addressField.QUICKFORM) {
					queryResult = await query(queryName.addAddressWithComment, [
						myOpenId,
						address.quickInputAddress
					])
				}
				res.send(queryResult.data)
				Logger.info('address added')
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('address add fail')
			}
		}
	)
	route.post(
		'/updateAddress',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const fileUrl = req.body.file
			const id = req.body.id
			const queryResult = await query(queryName.updateAddressWithFile, [
				fileUrl,
				id,
				myOpenId
			])
			res.send(queryResult.data)
			Logger.info('update success')
		}
	)
	route.post(
		'/uploadFile',
		isAuthenticated,
		upload.single('image'),
		async (req: Request, res: Response) => {
			const { id, imageSide } = req.body
			const file: any = req.file
			if (imageSide === Image.FRONT) {
				const queryResult = await query(queryName.updateAddressWithImageOne, [
					file.location,
					id,
					myOpenId
				])
				if (queryResult.count === 1) {
					res.send(file.location)
					Logger.info('upload image #1 success')
				} else {
					res.send({
						status: Status.FAIL
					})
				}
			} else if (imageSide === Image.BACK) {
				const queryResult = await query(queryName.updateAddressWithImageTwo, [
					file.location,
					id,
					myOpenId
				])
				if (queryResult.count === 1) {
					res.send(file.location)
					Logger.info('upload image #2 success')
				} else {
					res.send({
						status: Status.FAIL
					})
				}
			} else {
				res.send({
					status: Status.FAIL
				})
			}
		}
	)
	route.delete(
		'/deleteAddress',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const id = req.body.id
			const queryResult = await query(queryName.deleteAddress, [id, myOpenId])
			res.send(queryResult)
			Logger.info('update success')
		}
	)
	route.get(
		'/myCodes',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const queryResult = await query(queryName.myCodes, [myOpenId])
			res.send(queryResult.data)
			Logger.info('codes loaded success')
		}
	)
	route.post(
		'/newCode',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const newCode: string = makeCode()
			const queryResult = await query(queryName.newCode, [myOpenId, newCode])
			if (queryResult.count === 1) {
				query(queryName.updateCodeNumber, [queryResult.count, myOpenId])
				res.send(newCode)
				Logger.info('codes created')
			} else {
				res.send({
					status: Status.FAIL
				})
				Logger.info('codes created failed')
			}
		}
	)

	route.post(
		'/updateCodeStatus',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const code = req.body.code
			const queryResult = await query(queryName.usedCode, [code, myOpenId])
			if (queryResult.count === 1) {
				res.send('updated')
				Logger.info('codes delete')
			}
			res.send({
				status: Status.FAIL
			})
			Logger.info('codes delete failed')
		}
	)
	route.delete(
		'/removeConnection',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const id = req.body.id
			try {
				const queryResult = await query(queryName.removeConnection, [id])
				if (queryResult.count === 1) {
					res.send({
						status: Status.SUCCESS
					})
					const queryProduct = await query(queryName.getSaleProductsByFather, [
						queryResult.data[0].openIdChild,
						queryResult.data[0].openId
					])
					if (queryProduct.data.length > 0) {
						queryProduct.data.forEach(product => {
							query(queryName.updateProductToDELETEDByOpenIDFather, [
								product.inStoreProductId
							])
							disableWholeProductLine(
								queryResult.data[0].openIdChild,
								product.productId
							)
						})
					}
					Logger.info('unlock success')
				} else {
					res.send({
						status: Status.FAIL
					})
					Logger.info('unlock fail')
				}
			} catch (err) {
				res.send({
					status: Status.FAIL,
					message: err
				})
				Logger.info('unlock fail')
			}
		}
	)
	route.get(
		'/wxQRcode',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const result = await getQRcode(req.query)
			res.send({
				status: Status.SUCCESS,
				data: result.data
			})
		}
	)
	route.post(
		'/connectionWithoutCode',
		isAuthenticated,
		async (req: Request, res: Response) => {
			const { openIDFather } = req.body
			const checkAliasResult = await query(queryName.checkAliasExist, [
				openIDFather,
				myOpenId
			])
			if (!checkAliasResult.data[0]) {
				const queryResult = await query(queryName.createRelationship, [
					openIDFather,
					myOpenId
				])
				if (
					queryResult.data[0] &&
					queryResult.data[0].openIDFather === openIDFather
				) {
					res.send({
						status: Status.SUCCESS
					})
					Logger.info('success')
				} else {
					res.send({
						status: Status.FAIL,
						message: '关注失败'
					})
					Logger.info('failed')
				}
			} else if (checkAliasResult.data[0].status === AliasStatus.DISABLED) {
				const queryResult = await query(queryName.enableAlias, [
					openIDFather,
					myOpenId
				])
				if (
					queryResult.data[0] &&
					queryResult.data[0].openIDFather === openIDFather
				) {
					res.send({
						status: Status.SUCCESS
					})
					Logger.info('success')
				}
			}
		}
	)
}
