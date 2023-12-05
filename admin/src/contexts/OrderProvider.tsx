import React, { useState, ReactNode, useEffect } from "react";
import { Order } from "../models/index";
import { getOrders, updateOrder } from "../api/index";
import { OrderStatus, actions, snackMessage } from "../constant/index";
import { useSnackbar } from "notistack";

interface OrderContextType {
  orders: any;
  currentOrders: any;
  historyOrders: any;
  handleUpdateOrder: (order: any, action: string) => void;
}

const OrderContext = React.createContext<OrderContextType>(null!);

function useOrder() {
  return React.useContext(OrderContext);
}

function OrderProvider({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<any>(null);

  useEffect(() => {
    const loading = async () => {
      let result;
      result = await getOrders();
      setOrders(result.data);
    };
    loading();
  }, []);

  const currentOrders = orders.filter(
    (order: Order) =>
      order.status === "Paid" && order.trackingStatus === OrderStatus.PENDING
  );
  const historyOrders = orders.filter(
    (order: Order) =>
      order.status === "Paid" && order.trackingStatus !== OrderStatus.PENDING
  );
  const handleUpdateOrder = async (order: Order, action: string) => {
    const result = await updateOrder(order, action);
    if (result.status === 200) {
      let updatingOrders = [...orders];
      updatingOrders.forEach((currentOrder) => {
        if (
          currentOrder.orderId === order.orderId &&
          action === actions.reject.key
        ) {
          currentOrder.trackingStatus = "Canceled";
          enqueueSnackbar(snackMessage.success.reject);
        } else if (
          currentOrder.orderId === order.orderId &&
          action === actions.ship.key
        ) {
          currentOrder.company = order.company;
          currentOrder.trackingNumber = order.trackingNumber;
          currentOrder.trackingStatus = "Shipping";
          enqueueSnackbar(snackMessage.success.submit);
        } else if (
          currentOrder.orderId === order.orderId &&
          action === actions.edit.key
        ) {
          currentOrder = order;
          enqueueSnackbar(snackMessage.success.edit);
        }
      });
      setOrders(updatingOrders);
    } else {
      enqueueSnackbar(snackMessage.error.submit.message, {
        variant: snackMessage.error.submit.type,
      });
    }
  };

  return (
    <OrderContext.Provider
      value={{ orders, currentOrders, historyOrders, handleUpdateOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export default OrderProvider;
export { useOrder };
