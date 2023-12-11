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

export const updateProduct = async (product: any) => {
  const formData = new FormData();
  const { images, coverImage, ...rest } = product;
  const removedImages: any = [];
  coverImage.newFile && formData.append("coverImage", coverImage.newFile);
  images &&
    images.length > 0 &&
    images.forEach((image: any) => {
      if (image.hasDeleted) {
        removedImages.push(image);
      }
      if (image.newFile) {
        formData.append(
          "images",
          new File([image.newFile], image.id, { type: image.newFile.type })
        );
      }
    });
  formData.append("product", JSON.stringify({ ...rest, removedImages }));
  return axios.post("/admin/product/edit", formData);
};

export const updateProductStatus = (
  id: string,
  action: "Publish" | "Unpublish" | "Delete"
) => axios.post("/admin/product/status", { id, action });

export const getProducts = async () =>
  await axios.get("/admin/product/all-products");

export const getProductById = async (id: string) =>
  await axios.get(`/admin/product/${id}`);
