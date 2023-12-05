import React, { useState } from "react";
import { Navigator } from "../../components";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <div className="root">
      <Navigator handleOpenDialog={() => setOpenDialog(true)} />
      <Outlet />
    </div>
  );
}
