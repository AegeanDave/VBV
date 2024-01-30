import axios from "./index";

export const getOrders = async () => await axios.get("/admin/order/all");

export const getIdPhoto = async (id: string) =>
  await axios.get(`admin/order/id-photo?id=${id}`);

export const getPresignedUrl = async (url: string) =>
  axios("/admin/order/id-photo/presigned-url", {
    method: "GET",
    params: {
      url,
    },
  });

export const updateOrder = async (
  order: any,
  action: string,
  trackingInfo?: any
) => {
  return axios.post("/admin/order/action", {
    order,
    trackingInfo,
    action,
  });
};

export const downloadShipmentDoc = async () => {
  return axios.get("/admin/order/shipment/download", {
    responseType: "blob",
  });
};

export const downloadShipmentExcel = async () => {
  return axios.get("/admin/order/shipment/download/excel", {
    responseType: "blob",
  });
};
