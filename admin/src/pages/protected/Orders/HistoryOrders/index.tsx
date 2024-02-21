import { useOrder } from "../../../../contexts/OrderProvider";
import { Box, Typography, AppBar, Toolbar } from "@mui/material";
import { Masonry } from "@mui/lab";
import OrderCard from "../OrderCard";

const OrderHistory = () => {
  const { historyOrders, isLoading } = useOrder();

  if (historyOrders.length === 0 && !isLoading)
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
        <Typography variant="h5">暂无历史订单</Typography>
      </Box>
    );
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography textAlign="left">
              历史订单 {historyOrders.length} 个
            </Typography>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}></Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: 780, minHeight: 400 }} p={4}>
        <Masonry columns={2} spacing={2}>
          {historyOrders.map((order: any) => (
            <OrderCard key={order.id} order={order} readOnly></OrderCard>
          ))}
        </Masonry>
      </Box>
    </>
  );
};
export default OrderHistory;
