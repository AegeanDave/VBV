import React from "react";
import { Order } from "../../../models/index";
import OrderContainer from "../../../components/CardContainer";

interface Props {
  orders: Order[];
  updateOrder: (order: Order, action: string) => void;
  handleCopy: () => void;
}

const Orders = ({ orders, updateOrder, handleCopy }: Props) => {
  return (
    <OrderContainer
      orderList={orders}
      updateOrder={updateOrder}
      handleCopy={handleCopy}
    />
  );
};
export default Orders;
