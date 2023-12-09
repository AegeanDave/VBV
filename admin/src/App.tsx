import React from "react";
import "./App.css";
import ReactGA from "react-ga";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { RequireAuth } from "./contexts/AuthProvider";
import Layout from "./pages/Layout";
import { Typography } from "@mui/material";
import Root, {
  ProductList,
  Account,
  ProductDetail,
  loader,
  ProducttErrorBoundary,
} from "./pages";
import ProductProvider from "./contexts/ProductProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Typography>欢迎来到微帮微</Typography>,
          },
          {
            path: "product",
            element: (
              <ProductProvider>
                <ProductList />
              </ProductProvider>
            ),
          },
          {
            path: "product/:id",
            loader,
            element: <ProductDetail />,
            errorElement: <ProducttErrorBoundary />,
          },
          { path: "order" },
          { path: "order-history" },
          { path: "setting" },
          { path: "account" },
        ],
      },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
]);
export default function App() {
  return <RouterProvider router={router}></RouterProvider>;
}
