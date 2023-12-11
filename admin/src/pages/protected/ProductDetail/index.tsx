import React from "react";
import { LoaderFunctionArgs, json, useLoaderData } from "react-router-dom";
import ProductEditor from "./productEditor";
import { getProductById } from "../../../api/product";

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
      images,
      ...restData
    } = result.data;
    return json({
      isFreeShipping,
      isIdRequired,
      coverImage: { coverImageUrl, newFile: null },
      images: images.map((image: any) => ({ hasDeleted: false, ...image })),
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

  if (!product) return <></>;

  return <ProductEditor product={product} />;
};

export default ProductDetail;
export { loader };
