import React, { useState } from "react";
import { Navigator } from "../../components";
import { Outlet, Navigate } from "react-router-dom";
import { ScreenDialog } from "../../components";
import ProductForm from "./NewProduct";
import { useAuth } from "../../contexts/AuthProvider";

export default function ProtectedLayout() {
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="root">
      <Navigator handleOpenDialog={() => setOpenDialog(true)} />
      <Outlet />
      <ScreenDialog
        open={openDialog}
        onClose={() => setOpenDialog((pre) => !pre)}
      >
        <ProductForm onClose={() => setOpenDialog((pre) => !pre)} />
      </ScreenDialog>
    </div>
  );
}
