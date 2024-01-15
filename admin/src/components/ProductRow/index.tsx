import { Button, TableRow, TableCell, ButtonGroup } from "@mui/material";
import { columns, actions } from "../../constant/index";
import { Product } from "../../models/index";
import placeholder from "../../assets/images/cover_image_placeholder.png";
import "./style.scss";
import { Link } from "react-router-dom";
import { useProduct } from "../../contexts/ProductProvider";

interface Props {
  product: Product;
  index: number;
}

export default function ProductRow({ product }: Props) {
  const { handleOpenDialog } = useProduct();

  return (
    product && (
      <TableRow hover role="checkbox" tabIndex={-1}>
        {columns.map((column) => (
          <TableCell key={column.type} align={column.align}>
            {column.type === "images" ? (
              <img
                src={product.coverImageUrl || placeholder}
                alt="产品图片"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  backgroundColor: "#d8d8d8",
                }}
              />
            ) : (
              product[column.type]
            )}
          </TableCell>
        ))}
        <TableCell key="action" align="center">
          <ButtonGroup variant="text">
            <Button
              size="small"
              onClick={() => handleOpenDialog(product.id, "Update")}
            >
              {product.storeRecord[0].status === "Active" ? "下架" : "上架"}
            </Button>
            <Link to={`/product/${product.id}`}>
              <Button size="small">{actions.edit.label}</Button>
            </Link>
            <Button
              size="small"
              onClick={() => handleOpenDialog(product.id, "Delete")}
            >
              {actions.delete.label}
            </Button>
          </ButtonGroup>
        </TableCell>
      </TableRow>
    )
  );
}
