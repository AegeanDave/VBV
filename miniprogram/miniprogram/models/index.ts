export type Product = {
  productId: string
  productName: string
  productDescription: string
  coverImageURL: string
  images: string[]
  quantity: number
  disabled: boolean
  idCardRequired: boolean
  freeShipping: boolean
  dealerSale: Sale
  mySale?: Sale
}
type Sale = {
  openId: string
  openIdFather: string
  name: string
  avatar: string
  price: string | number
  newPrice?: string | number
  priceId?: string
  serialForQRCode?: number
  inStoreProductId: string
  status: string
}
export type SaleOrder = {
  orderId: string
  orderNumber: string
  originOrderId: string
  status: OrderStatus
  buyer: User
  createdAt: string
  subOrders: SubOrder[]
  totalPrice: string | number
  lastUpdatedAt: string
  address: Address
  comment?: string
  newComment?: string
}

export type PurchasedOrder = {
  orderNumber: string
  originOrderId: string
  subOrders: SubOrder[]
  totalPrice: number | string
  address: Address
  createdAt: string
  lastUpdatedAt: string
  comment?: string
  commentEdited?: string
}
export type DealerOrder = {
  orderId: string
  orderNumber: string
  originOrderId: string
  dealer: User
  orderProducts: OrderProduct[]
  totalPrice: number | string
  address: Address
  status: OrderStatus
  createdAt: string
  lastUpdatedAt: string
  comment?: string
  newComment?: string
}
export type WarehouseOrder = {
  orderId: string
  orderNumber: string
  originOrderId: string
  subOrders: OrderProduct[]
  trackingStatus: 'Pending' | string
  address: Address
  createdAt: string
  lastUpdatedAt: string
  comment?: string
  newComment?: string
}

type SubOrder = {
  orderId?: string
  status?: OrderStatus
  dealer: User
  orderProducts: OrderProduct[]
}

export type OrderProduct = {
  productId: string
  productName: string
  productDescription: string
  coverImageURL: string
  price: string | number
  quantity: number
  openIdFather: string
  trackingNumber: string
  carrier: string
  status: ShipmentStatus
}
type User = {
  openId: string
  name: string
  avatar: string
}
export type Address = {
  addressId: string
  name: string
  phone: string
  country: string
  province: string
  city: string
  street: string
  idFrontImage?: string
  idBackImage?: string
  quickInputAddress?: string
}
type OrderStatus = 'Paid' | 'Unpaid' | 'Canceled'
type ShipmentStatus = 'Pending' | 'Canceled' | 'Shipping'


export interface IAppOption {
  globalData: {
    user?: {
      username: string,
      avatarUrl: string,
      status: 'Active' | 'Inactive' | 'Not_Verified',
      sessionKey: string,
    },
    reload: boolean,
    sentCodes?: string[],
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
