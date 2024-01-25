export type Product = {
  id: string;
  name: string;
  inStoreProductId?: string;
  description: string;
  images: Image[];
  coverImageUrl: string;
  price: number;
  quantity?: number;
  status?: string;
  storeRecord: any;
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
  id: string;
  user: any;
  orderDetails: any[];
  orderNumber: string;
  status:
    | "Paid"
    | "Unpaid"
    | "Cancelled"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Completed";
  buyer: any;
  address: Address;
  comment?: string;
  payment: any;
  newComment?: string;
  updatedAt: Date | string;
  createdAt: Date | string;
};

type User = {
  openId: string;
  name: string;
  avatar: string;
};

export type Address = {
  openId: string;
  addressId: string;
  recipient: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  street: string;
  idPhotoFrontUrl?: string;
  idPhotoBackUrl?: string;
  quickInput?: string;
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
