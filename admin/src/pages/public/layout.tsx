import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";

export const PublicLayout = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};

export default PublicLayout;
