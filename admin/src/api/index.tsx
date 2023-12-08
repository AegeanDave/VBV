import axios from "axios";
import { Product, Order, Image } from "../models/index";

interface Auth {
  phoneNumber: string;
  password: string;
}

axios.interceptors.response.use(
  (response) => response,
  (err) => {
    if (!err.response.status || err.response.status === 403) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.resolve(err);
  }
);
axios.defaults.headers.common = {
  authorization: localStorage.getItem("sessionKey"),
};
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
export const login = async (auth: Auth) =>
  await axios.post("/admin/warehouse/login", auth);

export const logout = () => axios.delete("/warehouse/logout");

export const getProducts = async () =>
  await axios.get("/warehouse/myWarehouseProducts");

export const getOrders = async () =>
  await axios.get("/warehouse/allSaleOrders");

export const updateProductStatus = async (product: Product, action: string) => {
  const result = await axios.post("/warehouse/updateSale", {
    product: {
      saleId: product.inStoreProductId,
      productId: product.productId,
      price: product.price,
    },
    action: action,
  });

  return result;
};

export const updateOrder = async (order: Order, action: string) => {
  const result = await axios.post("/warehouse/updateOrder", {
    order: order,
    action: action,
  });

  return result;
};

export const download = (url: string) => {
  return new Promise((resolve, reject) => {
    axios("/warehouse/download", {
      method: "GET",
      params: {
        url: url,
      },
    })
      .then((response) => {
        resolve(response.data.Body);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const sendSMSVerifcation = (phone: {
  countryCode: string;
  tel: string;
}) => axios.post("/admin/warehouse/sms", { phone });

export const getVerificationCode = (countryCode: string, phoneNumber: string) =>
  axios.post("/admin/warehouse/verification-code", {
    phoneNumber: countryCode + phoneNumber,
  });
export const verification = (verificationCode: string) =>
  axios.post("/warehouse/phoneVerification", { verificationCode });

export const signup = (data: any) =>
  axios.post("/admin/warehouse/verify", data);

export const saveSetting = (emailService: boolean, smsService: boolean) =>
  axios.post("/warehouse/updateSetting", { emailService, smsService });

export default axios;
