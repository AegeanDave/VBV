import { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  IconButton,
  Card,
  Avatar,
  Button,
  Divider,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { Order, OrderItem } from "../../../../models/index";
import CopyToClipboard from "react-copy-to-clipboard";
import { ContentCopy } from "@mui/icons-material";
import ActionField from "./ActionField";
import moment from "../../../../utils";
import { useSnackbar } from "notistack";
import IdPhoto from "./IdPhotoField";
import { StatusLabel } from "../../../../constant";

interface OrderProps {
  order: Order;
  readOnly?: boolean;
}

export default function OrderCard({ order, readOnly }: OrderProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [isShowPhotos, setIsShowPhotos] = useState(false);
  const handleCopy = () => {
    enqueueSnackbar("信息已复制", { variant: "info" });
  };

  const handleGetIdPhoto = () => {
    setIsShowPhotos(true);
  };
  const ifCredential = order.orderDetails.find(
    (product: any) => product.setting?.isIdRequired
  );
  return (
    <Card>
      <Grid container p={2}>
        <Grid item container xs={12}>
          <Grid item xs container spacing={1} alignItems="center">
            <Grid item xs={5} textAlign="left">
              <Typography variant="subtitle2" fontWeight={600}>
                {order.orderNumber}
              </Typography>
            </Grid>
            <Grid item xs={7} textAlign="right">
              <Typography fontSize={12} variant="subtitle2">
                {moment(order.createdAt).format("YYYY-MM-DD h:mma")}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Avatar
                src={order.user.avatarUrl}
                alt={order.user.username}
                sx={{ width: 18, height: 18 }}
              ></Avatar>
            </Grid>
            <Grid item xs textAlign="left">
              <Typography fontSize={12} variant="caption">
                {order.user.username}
              </Typography>
            </Grid>
            <Grid item xs textAlign="right">
              <Chip
                color="primary"
                label={
                  <Typography fontSize={10}>
                    {StatusLabel[order.status]}
                  </Typography>
                }
                size="small"
              ></Chip>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} pt={1} pb={1}>
          <Divider variant="fullWidth">
            <Chip
              label={<Typography fontSize={10}>订单详情</Typography>}
              size="small"
            ></Chip>
          </Divider>
        </Grid>
        <Grid item xs={12} container>
          {order.orderDetails.map((product: OrderItem, index: number) => (
            <Grid container spacing={1} key={index}>
              <Grid item xs={4}>
                <img
                  style={{ width: 80, height: 80 }}
                  alt={product.productInfo.name}
                  src={product.productInfo.coverImageUrl}
                />
              </Grid>
              <Grid item xs container spacing={2} textAlign="right">
                <Grid item xs={12} textAlign="left">
                  <Typography variant="body2" gutterBottom>
                    {product.productInfo.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} container justifyContent="space-between">
                  <Typography variant="body2">
                    ¥{product.productInfo.price}
                  </Typography>
                  <Typography variant="body2">x {product.quantity}</Typography>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Grid item xs={12}>
          <Divider variant="fullWidth">
            <Chip
              label={<Typography fontSize={10}>收货地址</Typography>}
              size="small"
            ></Chip>
          </Divider>
        </Grid>
        <Grid item xs={12} container pt={1}>
          <Paper elevation={1} sx={{ p: 2, width: "100%" }}>
            <Stack direction="row" justifyContent="space-between">
              {order.address?.quickInput ? (
                <Typography variant="caption" fontSize={12}>
                  {order.address.quickInput}
                </Typography>
              ) : (
                <Box textAlign="left">
                  <Typography fontSize={14} fontWeight={600}>
                    {order.address?.recipient}
                  </Typography>
                  <Typography fontSize={12}>{order.address?.phone}</Typography>
                  <Typography fontSize={14}>
                    {order.address?.province} {order.address?.city}{" "}
                    {order.address?.street}
                  </Typography>
                </Box>
              )}
              <CopyToClipboard
                text={
                  order.address?.quickInput ||
                  order.address?.recipient +
                    " " +
                    order.address?.phone +
                    " " +
                    order.address?.province +
                    " " +
                    order.address?.city +
                    " " +
                    order.address?.street
                }
                onCopy={handleCopy}
              >
                <IconButton size="small">
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </CopyToClipboard>
            </Stack>
          </Paper>
          {ifCredential && !isShowPhotos && (
            <Grid item xs={12} textAlign="right" p={1}>
              <Button onClick={handleGetIdPhoto} size="small">
                获取收件人凭证
              </Button>
            </Grid>
          )}
          {isShowPhotos && <IdPhoto id={order.address.openId} />}
        </Grid>
        {!readOnly && (
          <>
            <Grid item xs={12} pt={1}>
              <Divider variant="fullWidth">
                <Chip
                  label={<Typography fontSize={10}>发货操作</Typography>}
                  size="small"
                ></Chip>
              </Divider>
            </Grid>
            <ActionField order={order} />
          </>
        )}
        {readOnly && (
          <>
            <Grid item xs={12} pt={1}>
              <Typography variant="body2" textAlign="left">
                运输公司：{order.orderDetails[0]?.shipment.carrier}
              </Typography>
              <Typography variant="body2" textAlign="left">
                运单号：{order.orderDetails[0]?.shipment.trackingNum}
              </Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Card>
  );
}
