import React, { useState, useEffect, ReactNode, useContext } from "react";
import { Product } from "../models/index";
import { getProducts } from "../api/product";
import { useSnackbar } from "notistack";

interface ProductContextType {
  loading: boolean;
  products: any;
  error: any;
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
        setProducts(result.data);
      } catch (err) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ loading, error, products }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductProvider;
export { useProduct };
