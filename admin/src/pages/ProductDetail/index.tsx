import React, { useState } from "react";
import { LoaderFunctionArgs, json, useLoaderData } from "react-router-dom";
import { useSnackbar } from "notistack";
import ProductEditor from "./productForm";
import { getProductById } from "../../api/product";

const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const result = await getProductById(params.id as string);
    if (!result.data) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }
    const {
      setting: { isFreeShipping, isIdRequired },
      coverImageUrl,
      ...restData
    } = result.data;
    return json({
      isFreeShipping,
      isIdRequired,
      coverImage: coverImageUrl,
      ...restData,
    });
  } catch (err: any) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
};
const ProductDetail = () => {
  const product = useLoaderData();
  const { enqueueSnackbar } = useSnackbar();

  //   if (isLoading)
  //     return (
  //       <Box p={4}>
  //         <CircularProgress></CircularProgress>
  //       </Box>
  //     );
  //   if (!product && !isLoading) return <Navigate to="/product"></Navigate>;
  if (!product) return <></>;

  return <ProductEditor product={product} />;
};

export default ProductDetail;
export { loader };
