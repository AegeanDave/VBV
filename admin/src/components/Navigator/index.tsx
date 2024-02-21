import React from "react";
import logo from "../../assets/images/logo.png";
import {
  Avatar,
  Divider,
  Typography,
  Button,
  Drawer,
  CssBaseline,
  DialogContent,
  Box,
  ListItemButton,
  List,
  ListItemText,
  Collapse,
} from "@mui/material";
import Popup from "../Popup/index";
import { navigators } from "../../constant/index";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import "./style.scss";

interface Props {
  orderBadge?: number;
  handleOpenDialog: () => void;
}

export default function PermanentDrawerLeft({
  handleOpenDialog,
  orderBadge,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [nestOpen, setNestOpen] = React.useState(false);
  const { signout } = useAuth();

  const handleOpenPopup = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const PopupContent = () => {
    return <DialogContent dividers>请联系 info@vbangv.com</DialogContent>;
  };

  return (
    <>
      <CssBaseline />
      <Drawer
        className="drawer"
        variant="permanent"
        classes={{
          paper: "drawerPaper",
        }}
        anchor="left"
      >
        <div className="sideBarHeader">
          <Avatar alt="logo" src={logo} className="avatarLarge" />
          <Typography component="h5" className="title">
            微帮微仓库管理系统
          </Typography>
        </div>
        <Box flex={1}>
          <List>
            <NavLink to={navigators.productList.path}>
              {({ isActive }) => (
                <ListItemButton selected={isActive}>
                  <ListItemText
                    primary={navigators.productList.label}
                    primaryTypographyProps={{
                      color: "white",
                    }}
                  ></ListItemText>
                </ListItemButton>
              )}
            </NavLink>
            <ListItemButton
              className="navigatorbtn upload"
              onClick={handleOpenDialog}
            >
              <ListItemText
                primaryTypographyProps={{
                  color: "white",
                }}
              >
                上传自营产品
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setNestOpen((pre) => !pre);
              }}
            >
              <ListItemText
                primaryTypographyProps={{
                  color: "white",
                }}
              >
                仓库订单
              </ListItemText>
              {nestOpen ? (
                <ExpandLess sx={{ color: "white" }} />
              ) : (
                <ExpandMore sx={{ color: "white" }} />
              )}
            </ListItemButton>
            <Collapse in={nestOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <NavLink to={navigators.order.path} end>
                  {({ isActive }) => (
                    <ListItemButton selected={isActive} sx={{ pl: 4 }}>
                      <ListItemText
                        primaryTypographyProps={{
                          color: "white",
                        }}
                      >
                        {navigators.order.label}
                        {orderBadge !== 0 && (
                          <div className="badge">{orderBadge}</div>
                        )}
                      </ListItemText>
                    </ListItemButton>
                  )}
                </NavLink>
                <NavLink to={navigators.history.path}>
                  {({ isActive }) => (
                    <ListItemButton selected={isActive} sx={{ pl: 4 }}>
                      <ListItemText
                        primaryTypographyProps={{
                          color: "white",
                        }}
                      >
                        {navigators.history.label}
                      </ListItemText>
                    </ListItemButton>
                  )}
                </NavLink>
              </List>
            </Collapse>
            <NavLink to={navigators.account.path}>
              {({ isActive }) => (
                <ListItemButton selected={isActive}>
                  <ListItemText
                    primaryTypographyProps={{
                      color: "white",
                    }}
                  >
                    {navigators.account.label}
                  </ListItemText>
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to={navigators.setting.path}>
              {({ isActive }) => (
                <ListItemButton selected={isActive}>
                  <ListItemText
                    primaryTypographyProps={{
                      color: "white",
                    }}
                  >
                    {navigators.setting.label}
                  </ListItemText>
                </ListItemButton>
              )}
            </NavLink>
          </List>
        </Box>
        <div className="btnGroupBottom">
          <Button onClick={handleOpenPopup}>联系客服</Button>
          <Divider
            orientation="vertical"
            flexItem
            classes={{ root: "dividerVertical" }}
          />
          <Button onClick={() => signout()}>退出登录</Button>
        </div>
      </Drawer>
      <Popup
        open={open}
        title={"请扫描二维码联系客服"}
        needConfirm={false}
        onClose={handleClose}
      >
        <PopupContent />
      </Popup>
    </>
  );
}
