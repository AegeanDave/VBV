import React from "react";
import { Add } from "@mui/icons-material";
import "./style.scss";
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  FormLabel,
  Checkbox,
  IconButton,
  styled,
  Button,
  FormControlLabel,
} from "@mui/material";
import { Product } from "../../models/index";
import { useProduct } from "../../contexts/ProductProvider";
import { useForm, Controller } from "react-hook-form";
import { getProductById } from "../../api/product";
import { useParams } from "react-router-dom";
import { Delete, AddBoxSharp } from "@mui/icons-material";
import { useSnackbar } from "notistack";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface Props {
  product: any;
}

const ProductEditor = ({ product }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, watch, register, setValue, formState } =
    useForm({
      defaultValues: { ...product, newImages: [] as File[] },
    });
  const onSubmit = (data) => {};
  console.log(product);

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
  const handleDeleteOldImage = (id: number) => {
    setValue(
      "images",
      watch("images").map((image: any) => {
        if (image.id === id) {
          image.status === "Deleted";
        }
        console.log(image);
        return image;
      })
    );
  };

  const handleDeleteNewImage = (index: number) => {
    setValue(
      "images",
      watch("newImages").filter((_, i) => i !== index)
    );
  };

  return (
    <Box width="100%" bgcolor="white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container p={4}>
          <Grid item xs={2}></Grid>
          <Grid item xs={7} container alignItems="flex-start" spacing={2}>
            <Grid item xs={7} p={2} textAlign="left">
              <Typography variant="subtitle1" gutterBottom>
                产品名称
              </Typography>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField {...field} size="small" fullWidth></TextField>
                )}
              ></Controller>
            </Grid>
            <Grid item xs={5} p={2} textAlign="left">
              <Typography variant="subtitle1" gutterBottom>
                价格
              </Typography>
              <Controller
                name="price"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ step: 0.01 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">RMB</InputAdornment>
                      ),
                    }}
                  />
                )}
              ></Controller>
            </Grid>
            <Grid item xs={12} p={2} textAlign="left">
              <Typography variant="subtitle1" gutterBottom>
                产品简介
              </Typography>
              <Controller
                control={control}
                name="shortDescription"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    multiline
                    value={field.value || ""}
                    rows={3}
                    fullWidth
                  ></TextField>
                )}
              ></Controller>
            </Grid>
            <Grid item xs={12} p={2} textAlign="left">
              <Typography variant="subtitle1" gutterBottom>
                产品描述
              </Typography>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={5}
                    value={field.value || ""}
                    size="small"
                    fullWidth
                  ></TextField>
                )}
              ></Controller>
            </Grid>
            <Grid item xs={12} textAlign="left" p={2}>
              <Typography variant="subtitle1">封面图片</Typography>
            </Grid>
            <Grid item xs={12} textAlign="left" p={2} className="imagesField">
              {watch("coverImage") ? (
                <div className="previewBox">
                  <img
                    src={
                      typeof watch("coverImage") === "string"
                        ? watch("coverImage")
                        : URL.createObjectURL(watch("coverImage"))
                    }
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
                <IconButton component="label">
                  <AddBoxSharp style={{ fontSize: 100, color: "#d8d8d8" }} />
                  <VisuallyHiddenInput
                    accept="image/*"
                    className="input"
                    id="cover-file"
                    type="file"
                    {...register("images", { required: true })}
                    onChange={handleCoverImageChange}
                  />
                </IconButton>
              )}
            </Grid>
            <Grid item xs={12} className="imagesField">
              {watch("images").map((image: any, index: number) => (
                <div className="previewBox" key={index}>
                  <img src={image.url} className="preview" alt="preview" />
                  <IconButton
                    aria-label="delete"
                    className="delete"
                    onClick={() => handleDeleteOldImage(image.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </div>
              ))}
              {watch("newImages").map((image: File, index: number) => (
                <div className="previewBox" key={index}>
                  <img
                    src={URL.createObjectURL(image)}
                    className="preview"
                    alt="preview"
                  />
                  <IconButton
                    aria-label="delete"
                    className="delete"
                    onClick={() => handleDeleteNewImage(index)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </div>
              ))}
              {watch("images").concat(watch("newImages")).length < 10 && (
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
                      <AddBoxSharp
                        style={{ fontSize: 134, color: "#d8d8d8" }}
                      />
                    </IconButton>
                  </label>
                </div>
              )}
            </Grid>
            <Grid item xs={12} textAlign="left" p={2}>
              <Typography variant="subtitle1" gutterBottom>
                产品属性
              </Typography>
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
            </Grid>
            <Grid item>
              <Button type="submit">提交更改</Button>
            </Grid>
          </Grid>
          <Grid item xs></Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProductEditor;
