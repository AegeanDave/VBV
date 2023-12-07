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
  const result = await axios.post("/admin/products/new-product", formData);
  return result;
};
