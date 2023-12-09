import React from "react";
import { ProductTable, ScreenDialog } from "../../components/index";
import { Add } from "@mui/icons-material";
import { Fab, AppBar, Tabs, Tab } from "@mui/material";
import { Product } from "../../models/index";
import { updateProductStatus, updateProductInfo } from "../../api/index";
import {
  SaleStatus,
  actions,
  snackMessage,
  productStatusTabs,
} from "../../constant";
import { Backdrop, CircularProgress } from "@mui/material";
import "./style.scss";
import { useProduct } from "../../contexts/ProductProvider";

interface Props {
  openBackdrop: () => void;
  closeBackdrop: () => void;
}

const ProductList = () => {
  const [currentProduct, setCurrentProduct] = React.useState<
    Product | undefined
  >();
  const [tabIndex, setTabIndex] = React.useState(0);
  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };
  const { products } = useProduct();
  //   const handleProductInfo = async (
  //     product: Product,
  //     action: string,
  //     uploadCoverImage?: File
  //   ) => {
  //     let currentProducts = [...productList];
  //     openBackdrop();
  //     const result = await updateProductInfo(product, action, uploadCoverImage);
  //     if (result.status === 200) {
  //       if (action === actions.submit.key) {
  //         product = result.data;
  //         product.status = SaleStatus.ENABLED;
  //         currentProducts.unshift(product);
  //         snackOpen(snackMessage.success.submit);
  //       } else if (action === actions.edit.key) {
  //         currentProducts.forEach((item: Product, index: number) => {
  //           if (product.productId === item.productId) {
  //             currentProducts[index] = result.data;
  //           }
  //         });
  //         snackOpen(snackMessage.success.edit);
  //       }
  //       setProductList(currentProducts);
  //     }
  //     closeBackdrop();
  //     handleClose();
  //   };
  //   const handleUpdateStatus = async (row: Product, action: string) => {
  //     let currentProducts = [...productList];
  //     const result = await updateProductStatus(row, action);
  //     if (result.status === 200) {
  //       if (action === actions.delete.key) {
  //         const newProductList = currentProducts.filter(
  //           (product: Product) => product.productId !== row.productId
  //         );
  //         setProductList(newProductList);
  //       } else if (action === actions.release.key) {
  //         currentProducts.forEach((product: Product) => {
  //           if (product.productId === row.productId)
  //             product.status = SaleStatus.ENABLED;
  //         });
  //         setProductList(currentProducts);
  //       } else if (action === actions.unrelease.key) {
  //         currentProducts.forEach((product: Product) => {
  //           if (product.productId === row.productId)
  //             product.status = SaleStatus.IDLE;
  //         });
  //         setProductList(currentProducts);
  //       }
  //       snackOpen(snackMessage.success.edit);
  //       handleClose();
  //     }
  //   };
  const [open, setOpen] = React.useState(false);

  const handleClickOpenToEdit = (product: Product) => {
    setCurrentProduct(product);
    setOpen(true);
  };
  const handleClickOpenToCreate = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setCurrentProduct(undefined);
  };
  const publishedProducts = products.filter(
    (product: Product) => product.status === "Active"
  );
  const unpublishedProducts = products.filter(
    (product: Product) => product.status === "Inactive"
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
        onClick={() => handleClickOpenToCreate()}
      >
        <Add fontSize="large" style={{ color: "fff" }} />
      </Fab>
      {/* {!currentProduct ? (
        <ScreenDialog
          open={open}
          handleClose={handleClose}
          action={actions.submit.key}
          handleUpdateProductInfo={handleProductInfo}
        ></ScreenDialog>
      ) : (
        <ScreenDialog
          open={open}
          handleClose={handleClose}
          productInfo={currentProduct}
          action={actions.edit.key}
          handleUpdateProductInfo={handleProductInfo}
        ></ScreenDialog>
      )}
      <Backdrop className="backdrop" open={openBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop> */}
    </div>
  );
};

export default ProductList;
