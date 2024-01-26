import React, { useState, useEffect, ReactNode, useContext } from "react";
import { Product } from "../models/index";
import { getProducts, updateProductStatus } from "../api/product";
import { Popup } from "../components";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";

interface ProductContextType {
  loading: boolean;
  products: Product[];
  error: any;
  handleConfirmUpdate: (action: "Publish" | "Unpublish" | "Delete") => void;
  handleOpenDialog: (id: string, type: "Delete" | "Update") => void;
}

const ProductContext = React.createContext<ProductContextType>(null!);

function useProduct() {
  return useContext(ProductContext);
}

function ProductProvider({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = React.useState(false);
  const [editPopupOpen, setEditPopupOpen] = React.useState(false);
  useEffect(() => {
    setLoading(true);
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
  }, [location.state?.key]);

  const handleConfirmUpdate = async (
    action: "Publish" | "Unpublish" | "Delete"
  ) => {
    try {
      await updateProductStatus(selectedProductId, action);
      enqueueSnackbar("更新成功");
      if (action === "Delete") {
        setDeletePopupOpen(false);
        setProducts((prev) =>
          prev.filter((item) => item.id !== selectedProductId)
        );
      }
      if (action === "Unpublish") {
        setEditPopupOpen(false);
        setProducts((prev) =>
          prev.map((item) => {
            if (item.id === selectedProductId)
              return {
                ...item,
                storeRecord: [{ ...item.storeRecord[0], status: "Inactive" }],
              };
            return item;
          })
        );
      }
      if (action === "Publish") {
        setEditPopupOpen(false);
        setProducts((prev) =>
          prev.map((item) => {
            if (item.id === selectedProductId)
              return {
                ...item,
                storeRecord: [{ ...item.storeRecord[0], status: "Active" }],
              };
            return item;
          })
        );
      }
    } catch (err) {
      console.log(err);
      enqueueSnackbar("更新失败");
    }
  };

  const handleOpenDialog = (id: string, type: "Delete" | "Update") => {
    setSelectedProductId(id);
    if (type === "Delete") {
      setDeletePopupOpen(true);
    }
    if (type === "Update") {
      setEditPopupOpen(true);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        loading,
        error,
        products,
        handleConfirmUpdate,
        handleOpenDialog,
      }}
    >
      {children}
      <Popup
        open={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        needConfirm={true}
        title="确认删除"
        onConfirm={() => handleConfirmUpdate("Delete")}
      >
        您的订单产品会保留
      </Popup>
      <Popup
        open={editPopupOpen}
        onClose={() => setEditPopupOpen(false)}
        needConfirm={true}
        onConfirm={() => {
          const tempProduct = products.filter(
            (product) => product.id === selectedProductId
          );
          handleConfirmUpdate(
            tempProduct[0].storeRecord[0].status === "Active"
              ? "Unpublish"
              : "Publish"
          );
        }}
        title="确认编辑"
      />
    </ProductContext.Provider>
  );
}

export default ProductProvider;
export { useProduct };
