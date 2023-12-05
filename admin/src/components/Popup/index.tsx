import React from "react";
import { DialogActions, DialogTitle, Dialog, Button } from "@mui/material";
import "./style.scss";

interface Props {
  open: boolean;
  handleClose: () => void;
  handleConfirm?: () => void;
  needConfirm: boolean;
  title: string;
  Content?: () => any;
}
export default function AlertDialog({
  Content,
  title,
  open,
  handleClose,
  needConfirm,
  handleConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={"sm"}
      className="dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      {Content && <Content />}
      {needConfirm && (
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            取消
          </Button>
          <Button onClick={handleConfirm} className="confirm">
            确定
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
