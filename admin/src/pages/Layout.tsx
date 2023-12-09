import React, { useState } from "react";
import { Navigator } from "../components";
import { Outlet } from "react-router-dom";
import { ScreenDialog } from "../components";
import ProductForm from "./NewProduct";
import { RequireAuth } from "../contexts/AuthProvider";

export default function Layout() {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <RequireAuth>
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
    </RequireAuth>
  );
}
