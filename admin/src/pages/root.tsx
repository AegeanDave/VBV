import React from "react";
import AuthProvider from "../contexts/AuthProvider";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
