import React from "react";
import OrderProvider from "../../../contexts/OrderProvider";
import { useOutlet } from "react-router-dom";

const Layout = () => {
  const outlet = useOutlet();
  return <OrderProvider>{outlet}</OrderProvider>;
};
export default Layout;
