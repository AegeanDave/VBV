import React, { useState } from "react";
import { Navigator } from "../../components";
import { Outlet } from "react-router-dom";
import { ScreenDialog } from "../../components";
import ProductForm from "../NewProduct";
import ProductProvider from "../../contexts/ProductProvider";

export default function Layout() {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <ProductProvider>
      <div className="root">
        <Navigator handleOpenDialog={() => setOpenDialog(true)} />
        <Outlet />
        <ScreenDialog
          open={openDialog}
          onClose={() => setOpenDialog((pre) => !pre)}
        >
          <ProductForm />
        </ScreenDialog>
      </div>
    </ProductProvider>
  );
}
