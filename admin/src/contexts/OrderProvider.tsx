import React, { useState, ReactNode, useEffect, useMemo } from "react";
import { Order } from "../models/index";
import { getOrders } from "../api/order";
import { OrderStatus, actions, snackMessage } from "../constant/index";
import { useSnackbar } from "notistack";

interface OrderContextType {
  orders: any;
  currentOrders: any;
  historyOrders: any;
}

const OrderContext = React.createContext<OrderContextType>(null!);

function useOrder() {
  return React.useContext(OrderContext);
}

function OrderProvider({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<any>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const result = await getOrders();
      setOrders(result.data);
    };
    fetchOrders();
  }, []);

  //   const handleUpdateOrder = async (order: Order, action: string) => {
  //     const result = await updateOrder(order, action);
  //     if (result.status === 200) {
  //       let updatingOrders = [...orders];
  //       updatingOrders.forEach((currentOrder) => {
  //         if (
  //           currentOrder.orderId === order.orderId &&
  //           action === actions.reject.key
  //         ) {
  //           currentOrder.trackingStatus = "Canceled";
  //           enqueueSnackbar(snackMessage.success.reject);
  //         } else if (
  //           currentOrder.orderId === order.orderId &&
  //           action === actions.ship.key
  //         ) {
  //           currentOrder.company = order.company;
  //           currentOrder.trackingNumber = order.trackingNumber;
  //           currentOrder.trackingStatus = "Shipping";
  //           enqueueSnackbar(snackMessage.success.submit);
  //         } else if (
  //           currentOrder.orderId === order.orderId &&
  //           action === actions.edit.key
  //         ) {
  //           currentOrder = order;
  //           enqueueSnackbar(snackMessage.success.edit);
  //         }
  //       });
  //       setOrders(updatingOrders);
  //     } else {
  //       enqueueSnackbar(snackMessage.error.submit.message, {
  //         variant: snackMessage.error.submit.type,
  //       });
  //     }
  //   };

  const values = useMemo(
    () => ({
      orders,
      currentOrders: orders.filter(
        (order: Order) =>
          order.status === "Paid" || order.status === "Processing"
      ),
      historyOrders: orders.filter(
        (order: Order) =>
          order.status === "Completed" || order.status === "Delivered"
      ),
    }),
    [orders]
  );
  return (
    <OrderContext.Provider value={values}>{children}</OrderContext.Provider>
  );
}

export default OrderProvider;
export { useOrder };
