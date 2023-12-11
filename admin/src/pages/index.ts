import Account from "./protected/Account";
import ProductDetail, { loader } from "./protected/ProductDetail";
import ProductErrorBoundary from "./protected/ProductDetail/productErrorBoundary";
import ProductList from "./protected/ProductList";
import Dashboard from "./protected/Dashboard";
import Root from "./root";
import PublicLayout from "./public/layout";
import ProtectedLayout from "./protected/layout";
import OrderLayout from "./protected/Orders/layout";
export default Root;

export {
  Account,
  Dashboard,
  ProductDetail,
  loader,
  ProductErrorBoundary,
  ProductList,
  PublicLayout,
  ProtectedLayout,
  OrderLayout,
};
