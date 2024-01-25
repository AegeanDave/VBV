import React from "react";
import { Order } from "../../../models/index";
import { useOrder } from "../../../contexts/OrderProvider";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Masonry } from "@mui/lab";
import OrderCard from "./OrderCard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { downloadShipmentDoc } from "../../../api/order";

const Orders = () => {
  const { currentOrders, isLoading } = useOrder();
  const [anchorElOption, setAnchorElOption] =
    React.useState<null | HTMLElement>(null);

  const handleOpenOptionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElOption(event.currentTarget);
  };

  const handleDownloadShipment = async () => {
    try {
      const response = await downloadShipmentDoc();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "shipment.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

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
    <>
      <AppBar>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              edge="end"
              aria-haspopup="true"
              onClick={handleOpenOptionMenu}
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElOption}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElOption)}
              onClose={() => {
                setAnchorElOption(null);
              }}
            >
              <MenuItem
                key="download-shipment"
                onClick={handleDownloadShipment}
              >
                <ListItemIcon>
                  <SaveAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>下载出货单</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        sx={{ width: 780, minHeight: 400, margin: "0 auto", marginTop: "80px" }}
        p={2}
      >
        <Masonry columns={2} spacing={2}>
          {currentOrders.map((order: any) => (
            <OrderCard key={order.id} order={order}></OrderCard>
          ))}
        </Masonry>
      </Box>
    </>
  );
};
export default Orders;
