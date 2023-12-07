import React, { ReactNode } from "react";
import {
  IconButton,
  Typography,
  Dialog,
  AppBar,
  Toolbar,
  Slide,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";
import "./style.scss";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function ScreenDialog({
  open,
  onClose,
  children,
  title = "上传",
}: Props) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar position="sticky" className="appBar">
        <Toolbar>
          <Typography variant="h6" className="title">
            {title}
          </Typography>
          <IconButton onClick={onClose} className="cancel">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
