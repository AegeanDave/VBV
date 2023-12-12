import React from "react";
import "./App.css";
import ReactGA from "react-ga";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import Root, {
  ProductList,
  Account,
  ProductDetail,
  loader,
  Dashboard,
  ProductErrorBoundary,
  PublicLayout,
  ProtectedLayout,
  OrderLayout,
} from "./pages";
import ProductProvider from "./contexts/ProductProvider";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
  createRoutesFromElements,
  Route,
  defer,
} from "react-router-dom";
import { logout } from "./api";

const getUserData = () =>
  new Promise((resolve) => {
    const user = localStorage.getItem("user");
    resolve(user);
  });

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<Root />}
      loader={() => defer({ usePromise: getUserData() })}
    >
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
      </Route>
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Dashboard />}></Route>
        <Route
          path="product"
          element={
            <ProductProvider>
              <ProductList />
            </ProductProvider>
          }
        ></Route>
        <Route
          path="product/:id"
          element={<ProductDetail />}
          loader={loader}
          errorElement={<ProductErrorBoundary />}
        ></Route>
        <Route path="order" element={<OrderLayout />}>
          <Route index element={<div>111111</div>}></Route>
          <Route path="history" element={<>22222</>}></Route>
        </Route>
        <Route path="setting" element={<ProductDetail />}></Route>
        <Route path="account" element={<ProductDetail />}></Route>
      </Route>
      <Route
        path="/logout"
        action={async () => {
          await logout();
          localStorage.clear();
          return redirect("/login");
        }}
      ></Route>
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router}></RouterProvider>;
}
