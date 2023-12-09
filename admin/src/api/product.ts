import axios from "./index";

export const createNewProduct = async (product: any) => {
  const formData = new FormData();
  const { images, coverImage, ...rest } = product;
  formData.append("coverImage", coverImage);
  images &&
    images.length > 0 &&
    images.forEach((image: File) => {
      formData.append("images", image);
    });
  formData.append("product", JSON.stringify(rest));
  const result = await axios.post("/admin/product/new-product", formData);
  return result;
};

export const getProducts = async () =>
  await axios.get("/admin/product/all-products");

export const getProductById = async (id: string) =>
  await axios.get(`/admin/product/${id}`);
