import React, { useState } from "react";
import {
  TextField,
  Typography,
  Button,
  Grid,
  Checkbox,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import "./style.scss";
import { useForm, Controller } from "react-hook-form";
import { AddBoxSharp, Delete } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { snackMessage } from "../../../constant/index";
import { createNewProduct } from "../../../api/product";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
}

const ProductForm = ({ onClose }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    register,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      coverImage: undefined as any,
      images: [] as File[],
      isFreeShipping: false,
      isIdRequired: false,
    },
  });
  const [agreementChecked, setAgreementChecked] = React.useState(false);
  const onSubmit = async (data: any) => {
    try {
      const result = await createNewProduct(data);
      if (!result.data) {
        enqueueSnackbar("上传失败", { variant: "error" });
        return;
      }
      navigate("/product", { state: { key: result.data?.id }, replace: true });
      enqueueSnackbar(snackMessage.success.submit);
      onClose();
    } catch (err) {
      enqueueSnackbar("上传失败", { variant: "error" });
      return false;
    }
  };

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;
    const uploadedImage = event.target.files[0];
    if (event.target.files[0].size > 2 * 1024 * 1024) {
      enqueueSnackbar("每张图片大小不能超过 2MB", { variant: "warning" });
      return;
    }
    setValue("coverImage", uploadedImage as any);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const currentImages = watch("images");
      if (currentImages.length + files.length > 10) {
        enqueueSnackbar("最多可上传 10 张", { variant: "warning" });
        return;
      }
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 2 * 1024 * 1024) {
          enqueueSnackbar("每张图片大小不能超过 2MB", { variant: "warning" });
          return;
        }
        currentImages.push(files[i]);
      }
      setValue("images", currentImages);
    }
  };
  const handleDeleteImage = (index: number) => {
    setValue(
      "images",
      watch("images").filter((_, i) => i !== index)
    );
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container p={4}>
        <Grid item xs={1} md={2} lg={2}></Grid>
        <Grid item xs={10} md={7} lg={6} container spacing={3}>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              产品名称
            </Typography>
          </Grid>
          <Grid item xs={8} md={6}>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="最多26个字"
                  size="small"
                  fullWidth
                  inputProps={{
                    maxLength: "26",
                  }}
                />
              )}
            ></Controller>
          </Grid>
          <Grid item xs={2} md={4}></Grid>
          <Grid item xs={2}>
            <div className="textBox">
              <Typography variant="body2" component="label">
                封面图
              </Typography>
              <Typography variant="body2" component="label">
                (正方形)
              </Typography>
            </div>
          </Grid>
          <Grid item xs={10} className="imagesField">
            {watch("coverImage") ? (
              <div className="previewBox">
                <img
                  src={URL.createObjectURL(watch("coverImage"))}
                  className="preview"
                  alt="preview"
                />
                <IconButton
                  aria-label="delete"
                  className="delete"
                  onClick={() => setValue("coverImage", undefined as any)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </div>
            ) : (
              <div>
                <input
                  accept="image/*"
                  className="input"
                  id="cover-file"
                  type="file"
                  {...register("images", { required: true })}
                  onChange={handleCoverImageChange}
                />
                <label htmlFor="cover-file">
                  <IconButton aria-label="upload picture" component="span">
                    <AddBoxSharp style={{ fontSize: 134, color: "#d8d8d8" }} />
                  </IconButton>
                </label>
              </div>
            )}
          </Grid>
          <Grid item xs={2}>
            <div className="textBox">
              <Typography variant="body2" component="label">
                产品图片
              </Typography>
              <Typography variant="body2" component="label">
                (最多10张图)
              </Typography>
            </div>
          </Grid>
          <Grid item xs={10} className="imagesField">
            {watch("images").map((image, index) => (
              <div className="previewBox" key={index}>
                <img
                  src={URL.createObjectURL(image)}
                  className="preview"
                  alt="preview"
                />
                <IconButton
                  aria-label="delete"
                  className="delete"
                  onClick={() => handleDeleteImage(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </div>
            ))}
            {watch("images").length < 10 && (
              <div>
                <input
                  accept="image/*"
                  className="input"
                  id="icon-button-file"
                  multiple
                  type="file"
                  {...register("images", { required: false })}
                  onChange={handleImageChange}
                />
                <label htmlFor="icon-button-file">
                  <IconButton aria-label="upload picture" component="span">
                    <AddBoxSharp style={{ fontSize: 134, color: "#d8d8d8" }} />
                  </IconButton>
                </label>
              </div>
            )}
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              价格
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Controller
              name="price"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  type="number"
                  size="small"
                  inputProps={{ step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">¥</InputAdornment>
                    ),
                  }}
                />
              )}
            ></Controller>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              属性
            </Typography>
          </Grid>
          <Grid item xs={10} className="tagField">
            <FormControlLabel
              control={
                <Controller
                  name="isFreeShipping"
                  control={control}
                  render={({ field }) => (
                    <Checkbox {...field} checked={field.value} />
                  )}
                ></Controller>
              }
              label="包邮"
            />
            <Tooltip
              title="勾选后，用户在购买此商品时需要上传并核对身份证件。"
              placement="right-start"
            >
              <FormControlLabel
                control={
                  <Controller
                    name="isIdRequired"
                    control={control}
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value} />
                    )}
                  ></Controller>
                }
                label="海外直邮"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              文字简介
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="最多100字"
                  multiline
                  fullWidth
                  rows="3"
                  inputProps={{
                    maxLength: 100,
                  }}
                />
              )}
            ></Controller>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              产品描述
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="最多250字"
                  multiline
                  fullWidth
                  rows="8"
                  inputProps={{
                    maxLength: 250,
                  }}
                />
              )}
            ></Controller>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={10} container alignItems="center">
            <Grid item xs={1}>
              <Checkbox
                name="agreementChecked"
                size="small"
                checked={agreementChecked}
                onChange={(e) => {
                  setAgreementChecked(e.target.checked);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="body2" component="p">
                阅读
                <a href="#" className="agreement">
                  《国际商品上传规范》
                </a>
                ，您接受并同意遵守本许可的条款
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={10}>
            <Button
              variant="contained"
              type="submit"
              className="btn"
              disabled={
                !watch("name") ||
                !agreementChecked ||
                !watch("price") ||
                isSubmitting
              }
            >
              上传
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={1} md={3} lg={4}></Grid>
      </Grid>
    </form>
  );
};
export default ProductForm;
