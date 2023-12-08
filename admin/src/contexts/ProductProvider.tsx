import React, { useState, useEffect, ReactNode, useContext } from "react";
import { Product } from "../models/index";
import { createNewProduct, getProducts } from "../api/product";
import { useSnackbar } from "notistack";
import { snackMessage, SaleStatus } from "../constant/index";

interface ProductContextType {
  loading: boolean;
  products: any;
  error: any;
  handleCreate: (data: any, coverImage?: File, images?: File[]) => void;
}

const ProductContext = React.createContext<ProductContextType>(null!);

function useProduct() {
  return useContext(ProductContext);
}

function ProductProvider({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();
        console.log(result);
        setProducts(result.data);
      } catch (err) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCreate = async (data: Product) => {
    try {
      const result = await createNewProduct(data);

      if (!result.data) {
        enqueueSnackbar("上传失败", { variant: "error" });
        return;
      }
      setProducts((preProducts) => [...preProducts, result.data]);
      enqueueSnackbar(snackMessage.success.submit);
    } catch (err) {
      enqueueSnackbar("上传失败", { variant: "error" });
      return false;
    }
  };

  return (
    <ProductContext.Provider value={{ loading, error, products, handleCreate }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductProvider;
export { useProduct };
