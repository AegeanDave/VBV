import React, { useState, useEffect, ReactNode } from "react";
import { Product } from "../models/index";
import { createNewProduct } from "../api/product";
import { useSnackbar } from "notistack";
import { snackMessage, SaleStatus } from "../constant/index";

interface ProductContextType {
  products: any;
  handleCreate: (data: any, coverImage?: File, images?: File[]) => void;
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
      //   result = await getProducts();
      //   setProducts(result.data);
    };
    loading();
  }, []);

  const handleCreate = async (data: Product) => {
    console.log(data);
    const result = await createNewProduct(data);
    // if (result.status === 200) {
    //   const currentProducts = [...products];
    //   product = result.data;
    //   product.status = SaleStatus.ENABLED;
    //   currentProducts.unshift(product);
    //   setProducts(currentProducts);
    // }
    enqueueSnackbar(snackMessage.success.submit);
  };

  return (
    <ProductContext.Provider value={{ products, handleCreate }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductProvider;
export { useProduct };
