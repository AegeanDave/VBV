import React from "react";
import {
  Button,
  TableRow,
  TableCell,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { columns, SaleStatus, actions } from "../../constant/index";
import { Popup } from "../index";
import { Product } from "../../models/index";
import placeholder from "../../assets/images/cover_image_placeholder.png";
import "./style.scss";

interface Props {
  product: Product;
  index: number;
  clickOpen: (product: Product) => void;
  handleUpdateStatus: (product: Product, action: string) => void;
}
export default function ProductRow(props: Props) {
  const [deletePopupOpen, setDeletePopupOpen] = React.useState(false);
  const [editPopupOpen, setEditPopupOpen] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState("");

  const action =
    props.product.status === SaleStatus.ENABLED
      ? actions.unrelease
      : actions.release;
  const handlePopupOpen = (action: string) => {
    if (action === actions.edit.key) {
      setEditPopupOpen(true);
    } else if (action === actions.delete.key) {
      setDeletePopupOpen(true);
    }
    setCurrentAction(action);
  };
  const handleDeleteClose = () => {
    setDeletePopupOpen(false);
    setCurrentAction("");
  };
  const handleEditClose = () => {
    setEditPopupOpen(false);
    setCurrentAction("");
  };
  const popupConfirm = () => {
    props.handleUpdateStatus(props.product, currentAction);
    if (currentAction === actions.delete.key) {
      setDeletePopupOpen(false);
    } else if (currentAction === actions.edit.key) {
      setEditPopupOpen(false);
    }
    setCurrentAction("");
  };
  const DeletePopupContent = () => (
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        您的订单产品会保留
      </DialogContentText>
    </DialogContent>
  );
  return (
    props.product && (
      <>
        <TableRow
          hover
          role="checkbox"
          tabIndex={-1}
          key={props.product.productId}
        >
          {columns.map((column) => (
            <TableCell key={column.type} align={column.align}>
              {column.type === "images" ? (
                <img
                  src={props.product.coverImageURL || placeholder}
                  alt="产品图片"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "contain",
                    backgroundColor: "#d8d8d8",
                  }}
                />
              ) : (
                props.product[column.type]
              )}
            </TableCell>
          ))}
          <TableCell key="action" align="center">
            <Button
              color="primary"
              className={action === actions.unrelease ? "unrelease" : "release"}
              onClick={() =>
                props.handleUpdateStatus(props.product, action.key)
              }
            >
              {action.label}
            </Button>

            <Button
              color="primary"
              onClick={() => props.clickOpen(props.product)}
            >
              {actions.edit.label}
            </Button>
            <Button
              color="primary"
              onClick={() => handlePopupOpen(actions.delete.key)}
            >
              {actions.delete.label}
            </Button>
          </TableCell>
        </TableRow>
        <Popup
          open={deletePopupOpen}
          handleClose={handleDeleteClose}
          needConfirm={true}
          Content={DeletePopupContent}
          title={"确认删除"}
          handleConfirm={popupConfirm}
        />
        <Popup
          open={editPopupOpen}
          handleClose={handleEditClose}
          needConfirm={true}
          handleConfirm={popupConfirm}
          title={"确认编辑"}
        />
      </>
    )
  );
}
