import React from "react";
import {
  TextField,
  Typography,
  Button,
  Grid,
  Chip,
  Checkbox,
  InputAdornment,
  IconButton,
} from "@mui/material";
import "./style.scss";
import { Product, Image } from "../../models/index";
import { snackMessage } from "../../constant/index";
import { AddBoxSharp, Delete } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "notistack";

interface Props {
  productInfo?: Product;
  action: string;
  handleUpdateProductInfo: (
    product: Product,
    action: string,
    uploadCoverImage?: File
  ) => void;
}
const ProductForm = ({
  productInfo,
  action,
  handleUpdateProductInfo,
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [productName, setProductName] = React.useState(
    (productInfo && productInfo.productName) || ""
  );
  const [productDescription, setProductDescription] = React.useState(
    (productInfo && productInfo.productDescription) || ""
  );
  const [images, setImages] = React.useState<Image[]>(
    (productInfo && productInfo.images[0] && productInfo.images) ||
      ([] as Image[])
  );
  const [coverImageURL, setCoverImageURL] = React.useState(
    (productInfo && productInfo.coverImageURL) || ""
  );
  const [freeShipping, setFreeShipping] = React.useState(
    (productInfo && productInfo.freeShipping) || false
  );
  const [idCardRequired, setIdCardRequired] = React.useState(
    (productInfo && productInfo.idCardRequired) || false
  );
  const [price, setPrice] = React.useState(
    (productInfo && productInfo.price) || 0
  );
  const [agreementChecked, setAgreementChecked] = React.useState(false);
  const [uploadCoverImage, setUploadCoverImage] = React.useState<File>();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    handleUpdateProductInfo(
      {
        ...productInfo,
        productName,
        productDescription,
        price,
        coverImageURL,
        images,
        freeShipping,
        idCardRequired,
      },
      action,
      uploadCoverImage
    );
  };
  const handleUploadCoverImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!coverImageURL) {
      if (event.target.files) {
        const uploadedImage = event.target.files[0];
        if (event.target.files[0].size <= 1048576) {
          setCoverImageURL(URL.createObjectURL(uploadedImage));
          setUploadCoverImage(uploadedImage);
        } else {
          enqueueSnackbar(snackMessage.error.sizeOver.message);
        }
      }
    } else {
      enqueueSnackbar(snackMessage.error.sizeOver.message);
    }
  };
  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const currentImages = [...images];
      const imagesAvaliable = 10 - currentImages.length;
      if (imagesAvaliable < event.target.files.length) {
        snackOpen(snackMessage.error.imageOver);
      } else {
        for (let i = 0; i < event.target.files.length; i++) {
          if (event.target.files[i].size <= 1048576) {
            const image: Image = {
              id: uuidv4(),
              url: URL.createObjectURL(event.target.files[i]),
              tmpImage: true,
              file: event.target.files[i],
            };
            currentImages.push(image);
          } else {
            enqueueSnackbar(snackMessage.error.sizeOver.message);
            return;
          }
        }
        setImages(currentImages);
      }
    }
  };
  const handleDeleteImage = (id: string) => {
    const currentImages = [...images];
    const updatedImages = currentImages.filter((image) => image.id !== id);

    setImages(updatedImages);
  };
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} className="formBox">
        <Grid item xs={2}>
          <div className="textBox">
            <Typography variant="body2" component="label">
              产品名称
            </Typography>
          </div>
        </Grid>
        <Grid item xs={10}>
          <TextField
            id="productName"
            name="productName"
            placeholder="最多26个字"
            size="small"
            onChange={(e) => setProductName(e.target.value)}
            defaultValue={productName}
            fullWidth
            required
            inputProps={{
              maxLength: "26",
            }}
            variant="outlined"
          />
        </Grid>
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
          {coverImageURL && (
            <div className="previewBox">
              <img src={coverImageURL} className="preview" alt="preview" />
              <IconButton
                aria-label="delete"
                className="delete"
                onClick={() => setCoverImageURL("")}
              >
                <Delete fontSize="small" />
              </IconButton>
            </div>
          )}
          {!coverImageURL && (
            <div>
              <input
                accept="image/*"
                className="input"
                id="cover-file"
                required
                onChange={handleUploadCoverImage}
                type="file"
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
          {images.map((image, index) => (
            <div className="previewBox" key={image.id}>
              <img src={image.url} className="preview" alt="preview" />
              <IconButton
                aria-label="delete"
                className="delete"
                onClick={() => handleDeleteImage(image.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </div>
          ))}
          {images.length < 10 && (
            <div>
              <input
                accept="image/*"
                className="input"
                id="icon-button-file"
                onChange={handleUploadImage}
                multiple
                type="file"
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
          <TextField
            id="price"
            name="price"
            required
            type="number"
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            size="small"
            inputProps={{ step: 0.01 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">RMB</InputAdornment>
              ),
            }}
            defaultValue={price || null}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2" component="label">
            标签
          </Typography>
        </Grid>
        <Grid item xs={10} className="tagField">
          <Chip
            label="邮费到付"
            clickable
            classes={{ colorPrimary: "click", root: "chip" }}
            color={freeShipping ? "primary" : "default"}
            onClick={() => {
              setFreeShipping(!freeShipping);
            }}
          />
          <Chip
            label="包邮"
            clickable
            classes={{ colorPrimary: "click", root: "chip" }}
            color={!freeShipping ? "primary" : "default"}
            onClick={() => {
              setFreeShipping(!freeShipping);
            }}
          />
          <Chip
            label="海外直邮"
            clickable
            classes={{ colorPrimary: "click", root: "chip" }}
            color={idCardRequired ? "primary" : "default"}
            onClick={() => {
              setIdCardRequired(!idCardRequired);
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2" component="label">
            文字简介
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            id="description"
            name="productDescription"
            placeholder="最多250字"
            multiline
            fullWidth
            onChange={(e) => setProductDescription(e.target.value)}
            rows="8"
            inputProps={{
              maxLength: "250",
            }}
            defaultValue={productDescription}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={10} container alignItems="center" spacing={1}>
          <Grid item xs={1}>
            <Checkbox
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(!agreementChecked)}
              name="agreementChecked"
              required
              color="primary"
            />
          </Grid>
          <Grid item xs={9}>
            <Typography variant="body2" component="p">
              阅读
              <a href="#" className="agreement">
                《lorem ipsum》
              </a>
              ，您接受并同意遵守本许可的条款
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={10}>
          {productInfo ? (
            <Button color="primary" type="submit" className="btn">
              更改
            </Button>
          ) : (
            <Button color="primary" type="submit" className="btn">
              上传
            </Button>
          )}
        </Grid>
      </Grid>
    </form>
  );
};
export default ProductForm;
