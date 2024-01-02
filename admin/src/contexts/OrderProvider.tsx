import React, { useState, ReactNode, useEffect, useMemo } from "react";
import { Order } from "../models/index";
import { getOrders, updateOrder } from "../api/order";
import { OrderStatus, actions, snackMessage } from "../constant/index";
import { useSnackbar } from "notistack";

interface OrderContextType {
  orders: any;
  currentOrders: any;
  historyOrders: any;
  onShipping: (order: any, trackingInfo: any) => void;
  onCancelling: (order: any) => void;
  isLoading: boolean;
}

const OrderContext = React.createContext<OrderContextType>(null!);

const useOrder = () => React.useContext(OrderContext);

function OrderProvider({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await getOrders();
        setOrders(result.data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);
  const onShipping = async (order: any, trackingInfo: any) => {
    try {
      await updateOrder(order, "SHIP", trackingInfo);
      setOrders((preOrders) =>
        preOrders.map((item) => {
          if (item.id === order.id) {
            return { ...item, status: "Shipped" };
          }
          return item;
        })
      );
      enqueueSnackbar("发货成功", { variant: "success" });
    } catch (err) {}
  };

  const onCancelling = async (order: any) => {
    try {
      await updateOrder(order, "REJECT");
      setOrders((preOrders) =>
        preOrders.map((item) => {
          if (item.id === order.id) {
            return { ...item, status: "Cancelled" };
          }
          return item;
        })
      );
      enqueueSnackbar("订单已取消", { variant: "info" });
    } catch (err) {}
  };

  const values = useMemo(
    () => ({
      orders,
      currentOrders: orders.filter(
        (order: Order) =>
          order.status === "Paid" || order.status === "Processing"
      ),
      historyOrders: orders.filter(
        (order: Order) =>
          order.status === "Completed" ||
          order.status === "Delivered" ||
          order.status === "Shipped"
      ),
    }),
    [orders]
  );
  return (
    <OrderContext.Provider
      value={{ ...values, onShipping, onCancelling, isLoading }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export default OrderProvider;
export { useOrder };
