import React, { useState, ReactNode, useEffect, useMemo } from "react";
import { Order } from "../models/index";
import { getOrders, updateOrder } from "../api/order";
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
  const [orders, setOrders] = useState<Order[]>([]);
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
    setIsLoading(true);
    try {
      await updateOrder(order, "SHIP", trackingInfo);
      setIsLoading((pre) => !pre);
      setOrders((preOrders: any) =>
        preOrders.map((item: any) => {
          if (item.id === order.id) {
            return { ...item, status: "Shipped" };
          }
          return item;
        })
      );
      enqueueSnackbar("发货成功", { variant: "success" });
    } catch (err) {
      setIsLoading((pre) => !pre);
    }
  };
  const onCancelling = async (order: any) => {
    setIsLoading(true);
    try {
      await updateOrder(order, "REJECT");
      setIsLoading((pre) => !pre);
      setOrders((preOrders: Order[]) =>
        preOrders.map((item: Order) => {
          if (item.id === order.id) {
            return { ...item, status: "Cancelled" };
          }
          return item;
        })
      );
      enqueueSnackbar("订单已取消", { variant: "info" });
    } catch (err) {
      setIsLoading((pre) => !pre);
    }
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
