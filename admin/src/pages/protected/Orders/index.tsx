import React, { useState } from "react";
import { useOrder } from "../../../contexts/OrderProvider";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Masonry } from "@mui/lab";
import OrderCard from "./OrderCard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { downloadShipmentDoc, downloadShipmentExcel } from "../../../api/order";

const Orders = () => {
  const { currentOrders, isLoading } = useOrder();
  const [processing, setProcessing] = useState(false);
  const [anchorElOption, setAnchorElOption] =
    React.useState<null | HTMLElement>(null);

  const handleOpenOptionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElOption(event.currentTarget);
  };

  const handleDownloadShipment = async () => {
    setProcessing(true);
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
    } finally {
      setProcessing((pre) => !pre);
      setAnchorElOption(null);
    }
  };

  const handleDownloadShipmentExcel = async () => {
    setProcessing(true);
    try {
      const response = await downloadShipmentExcel();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "shipment.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    } finally {
      setProcessing((pre) => !pre);
      setAnchorElOption(null);
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
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography textAlign="left">
              待发货订单 {currentOrders.length} 个
            </Typography>
          </Box>
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
                disabled={processing}
                onClick={handleDownloadShipment}
              >
                <ListItemIcon>
                  <SaveAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>下载出货单PDF</ListItemText>
              </MenuItem>
              <MenuItem
                key="download-shipment-excel"
                disabled={processing}
                onClick={handleDownloadShipmentExcel}
              >
                <ListItemIcon>
                  <SaveAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>下载出货单Excel</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: 780, minHeight: 400 }} p={4}>
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
