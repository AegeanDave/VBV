import request from './request'

const getAuth = (code: string) => request.postRequest("users/login", { code })
const getSignup = (username: string, avatarUrl: string) => request.postRequest("users/signup", { username, avatarUrl })
const getCodes = () => request.getRequest("users/my-codes")
const getWarehouse = () => request.getRequest("warehouse/my-warehouse")

export { getAuth, getSignup, getCodes, getWarehouse }