import React, { Children, ReactNode } from "react";
import {
  DialogActions,
  DialogTitle,
  Dialog,
  Button,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import "./style.scss";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  needConfirm: boolean;
  title: string;
  children?: ReactNode;
}
export default function AlertDialog({
  children,
  title,
  open,
  onClose,
  needConfirm,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className="dialog"
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {children}
        </DialogContentText>
      </DialogContent>
      {needConfirm && (
        <DialogActions>
          <Button onClick={onClose} autoFocus>
            取消
          </Button>
          <Button onClick={onConfirm} className="confirm">
            确定
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
