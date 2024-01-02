import React from "react";
import { useOrder } from "../../../../contexts/OrderProvider";
import { Box } from "@mui/material";
import { Masonry } from "@mui/lab";
import OrderCard from "../OrderCard";

const OrderHistory = () => {
  const { historyOrders } = useOrder();
  return (
    <Box sx={{ width: 780, minHeight: 400, margin: "0 auto" }} p={2}>
      <Masonry columns={2} spacing={2}>
        {historyOrders.map((order: any) => (
          <OrderCard key={order.id} order={order} readOnly></OrderCard>
        ))}
      </Masonry>
    </Box>
  );
};
export default OrderHistory;
