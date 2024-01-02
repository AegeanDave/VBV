import React from "react";
import { Order } from "../../../models/index";
import { useOrder } from "../../../contexts/OrderProvider";
import { Box, Typography } from "@mui/material";
import { Masonry } from "@mui/lab";
import OrderCard from "./OrderCard";

const Orders = () => {
  const { currentOrders, isLoading } = useOrder();

  if (currentOrders.length === 0 && !isLoading)
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">暂无待处理订单</Typography>
      </Box>
    );
  return (
    <Box sx={{ width: 780, minHeight: 400, margin: "0 auto" }} p={2}>
      <Masonry columns={2} spacing={2}>
        {currentOrders.map((order: any) => (
          <OrderCard key={order.id} order={order}></OrderCard>
        ))}
      </Masonry>
    </Box>
  );
};
export default Orders;
