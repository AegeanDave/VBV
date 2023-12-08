import React from "react";
import "./style.scss";
import { navigators, actions } from "../../constant/index";
import Orders from "../CurrentOrders/index";
import OrdersHistory from "../HistoryOrders/index";
import ProductList from "../ProductList/index";
import Account from "../Account/index";
import Setting from "../Setting/index";
import { Route, Routes } from "react-router-dom";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route
        path={navigators.productList.path}
        element={<ProductList />}
      ></Route>
      <Route path={navigators.order.path} element={<></>}></Route>
      <Route
        path={navigators.setting.path}
        element={
          //   <Setting
          //     openBackdrop={() => setOpenBackdrop(true)}
          //     closeBackdrop={() => setOpenBackdrop(false)}
          //   />
          <></>
        }
      ></Route>
      <Route
        path={navigators.history.path}
        element={
          //   <OrdersHistory
          //     orders={historyOrders}
          //     updateOrder={handleUpdateOrder}
          //     handleCopy={handleCopy}
          //   />
          <></>
        }
      ></Route>
      <Route path={navigators.account.path} element={<Account />}></Route>
    </Routes>
  );
}
