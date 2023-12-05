import React from "react";
import {
  Table,
  Paper,
  TableHead,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
} from "@mui/material";
import ProductRow from "../ProductRow/index";
import "./style.scss";
import { columns } from "../../constant/index";
import { Product } from "../../models/index";

interface Props {
  clickOpen: (product: Product) => void;
  products: Product[];
  handleUpdateStatus: (product: Product, action: string) => void;
}

export default function ProductTable({
  clickOpen,
  products,
  handleUpdateStatus,
}: Props) {
  return (
    <Paper className="tableContainer">
      <TableContainer className="tableContainer">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.type}
                  variant="head"
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  classes={{
                    head: "head",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell
                key="action"
                variant="head"
                align="center"
                style={{ minWidth: 170 }}
                classes={{
                  head: "head",
                }}
              >
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row: Product, index: number) => {
              return (
                <ProductRow
                  product={row}
                  index={index}
                  key={row.productId}
                  clickOpen={clickOpen}
                  handleUpdateStatus={handleUpdateStatus}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
