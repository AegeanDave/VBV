import React from "react";
import "./style.scss";
import { navigators, actions } from "../../constant/index";
import Orders from "../CurrentOrders/index";
import OrdersHistory from "../HistoryOrders/index";
import { ScreenDialog } from "../../components";
import ProductList from "../ProductList/index";
import Account from "../Account/index";
import Setting from "../Setting/index";
import { Route } from "react-router-dom";

export default function PrivateRoute() {
  const [openBackdrop, setOpenBackdrop] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Route
        path={navigators.productList.path}
        element={
          <ProductList
            openBackdrop={() => setOpenBackdrop(true)}
            closeBackdrop={() => setOpenBackdrop(false)}
          />
        }
      ></Route>
      <Route
        path={navigators.order.path}
        element={<Orders handleCopy={handleCopy} />}
      ></Route>
      <Route
        path={navigators.setting.path}
        element={
          <Setting
            openBackdrop={() => setOpenBackdrop(true)}
            closeBackdrop={() => setOpenBackdrop(false)}
          />
        }
      ></Route>
      <Route
        path={navigators.history.path}
        element={
          <OrdersHistory
            orders={historyOrders}
            updateOrder={handleUpdateOrder}
            handleCopy={handleCopy}
          />
        }
      ></Route>
      <Route path={navigators.account.path} element={<Account />}></Route>
      <ScreenDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        action={actions.submit.key}
        handleUpdateProductInfo={handleProductInfo}
      ></ScreenDialog>
    </>
  );
}
