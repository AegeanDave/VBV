import React from "react";
import { Order } from "../../../models/index";
import { useOrder } from "../../../contexts/OrderProvider";
import { Box } from "@mui/material";
import { Masonry } from "@mui/lab";
import OrderCard from "./OrderCard";

const Orders = () => {
  const { currentOrders = [120, 150, 340, 80, 100] } = useOrder();
  return (
    <Box sx={{ width: 600, minHeight: 393 }}>
      <Masonry columns={2} spacing={2}>
        {currentOrders.map((order: any) => (
          <OrderCard key={order.id} order={order}></OrderCard>
        ))}
      </Masonry>
    </Box>
  );
};
export default Orders;
