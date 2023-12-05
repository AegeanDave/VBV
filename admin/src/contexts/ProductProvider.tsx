import React, { useState, useEffect, ReactNode } from "react";
import { Product } from "../models/index";
import { updateProductInfo, getProducts } from "../api/index";
import { useSnackbar } from "notistack";
import { snackMessage, SaleStatus } from "../constant/index";

interface ProductContextType {
  products: any;
  handleProductInfo: (order: any, action: string) => void;
}

const ProductContext = React.createContext<ProductContextType>(null!);

function useProduct() {
  return React.useContext(ProductContext);
}

function ProductProvider({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = React.useState<Product[]>([]);

  useEffect(() => {
    const loading = async () => {
      let result;
      result = await getProducts();
      setProducts(result.data);
    };
    loading();
  }, []);

  const handleProductInfo = async (
    product: Product,
    action: string,
    uploadCoverImage?: File,
    uploadImages?: File[]
  ) => {
    setOpenBackdrop(!openBackdrop);
    const result = await updateProductInfo(product, action, uploadCoverImage);
    if (result.status === 200) {
      const currentProducts = [...products];
      product = result.data;
      product.status = SaleStatus.ENABLED;
      currentProducts.unshift(product);
      setProducts(currentProducts);
      handleCloseDialog();
    }
    enqueueSnackbar(snackMessage.success.submit);
    setOpenBackdrop(false);
  };

  return (
    <ProductContext.Provider value={{ products, handleProductInfo }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductProvider;
export { useProduct };
