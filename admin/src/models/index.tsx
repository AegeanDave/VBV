export type Product = {
  name: string;
  productId?: string;
  inStoreProductId?: string;
  description: string;
  images: Image[];
  coverImageUrl: string;
  price: number;
  quantity?: number;
  status?: string;
  originalData: any;
  createdAt?: string;
  updatedAt?: string;
  setting: { isIdRequired: boolean; isFreeShipping: boolean };
  openId?: string;
};

export type SaleProduct = {
  productId?: string;
  inStoreProductId: string;
  price: number;
  quantity: number;
  status: string;
};
export type Order = {
  originOrderId: string;
  orderNumber: string;
  status: "Paid" | "Unpaid" | "Canceled" | "Deny";
  orderId: string;
  buyer: User;
  lastUpdatedAt: Date;
  createdAt: Date;
  orderProducts: Product[];
  address: Address;
  comment?: string;
  newComment?: string;
  company?: string;
  trackingStatus: "Pending" | "Canceled" | "Shipping";
  trackingNumber?: string;
};

type User = {
  openId: string;
  name: string;
  avatar: string;
};
export type Address = {
  addressId: string;
  name: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  street: string;
  idFrontImage?: string;
  idBackImage?: string;
  quickInputAddress?: string;
};
export type Image = {
  id: string;
  url: string;
  tmpImage?: boolean;
  priority?: number;
  file?: File;
};
export interface Column {
  type: "images" | "name" | "price";
  label: string;
  minWidth?: number;
  align?: "center";
  format?: (value: number) => string;
}

export type SnackBarProps = {
  type: "success" | "info" | "warning" | "error";
  message: string;
};
