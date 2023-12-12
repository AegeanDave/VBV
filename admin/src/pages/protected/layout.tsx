import React, { useState } from "react";
import { Navigator } from "../../components";
import { Outlet, Navigate } from "react-router-dom";
import { ScreenDialog } from "../../components";
import ProductForm from "./NewProduct";
import { useAuth } from "../../contexts/AuthProvider";
import { Box } from "@mui/material";

export default function ProtectedLayout() {
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Box width="100%" display="flex" minHeight="100vh">
      <Navigator handleOpenDialog={() => setOpenDialog(true)} />
      <Box flex={1}>
        <Outlet />
      </Box>
      <ScreenDialog
        open={openDialog}
        onClose={() => setOpenDialog((pre) => !pre)}
      >
        <ProductForm onClose={() => setOpenDialog((pre) => !pre)} />
      </ScreenDialog>
    </Box>
  );
}
