import React from "react";
import { ProductTable, ScreenDialog } from "../../../components/index";
import { Add } from "@mui/icons-material";
import { Fab, AppBar, Tabs, Tab } from "@mui/material";
import { Product } from "../../../models/index";
import { productStatusTabs } from "../../../constant";
import { Backdrop, CircularProgress } from "@mui/material";
import "./style.scss";
import { useProduct } from "../../../contexts/ProductProvider";
import ProductForm from "../NewProduct";

const ProductList = () => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };
  const { products } = useProduct();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const publishedProducts = products.filter(
    (product: Product) => product.storeRecord[0].status === "Active"
  );
  const unpublishedProducts = products.filter(
    (product: Product) => product.storeRecord[0].status === "Inactive"
  );
  return (
    <div className="mainBox">
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleChangeTab}
          variant="fullWidth"
          classes={{ indicator: "indicator" }}
          aria-label="full width tabs example"
        >
          <Tab label="已上架产品" />
          <Tab label="未上架产品" />
        </Tabs>
      </AppBar>
      <div className="table">
        {tabIndex === productStatusTabs.Published &&
          (publishedProducts.length === 0 ? (
            <div className="emptyTable">
              <span>暂无已上架产品</span>
            </div>
          ) : (
            <ProductTable products={publishedProducts} />
          ))}
        {tabIndex === productStatusTabs.Unpublished &&
          (unpublishedProducts.length === 0 ? (
            <div className="emptyTable">
              <span>暂无未上架产品</span>
            </div>
          ) : (
            <ProductTable products={unpublishedProducts} />
          ))}
      </div>
      <Fab
        aria-label="add"
        className="fab"
        size="large"
        onClick={() => setDialogOpen(true)}
      >
        <Add fontSize="large" style={{ color: "fff" }} />
      </Fab>
      <ScreenDialog
        open={dialogOpen}
        onClose={() => setDialogOpen((pre) => !pre)}
      >
        <ProductForm onClose={() => setDialogOpen((pre) => !pre)} />
      </ScreenDialog>
    </div>
  );
};

export default ProductList;
