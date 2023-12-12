import axios from "./index";

export const getOrders = async () => await axios.get("/admin/order/all");
