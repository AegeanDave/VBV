import React from "react";
import logo from "../../assets/images/logo.png";
import {
  Avatar,
  Typography,
  Grid,
  Box,
  Card,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import "./style.scss";
import { useAuth } from "../../contexts/AuthProvider";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";

type IFormInput = {
  phoneNumber: string;
  password: string;
};

export default function Login() {
  const { signin } = useAuth();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });
  const onSubmit = async (data: IFormInput) => {
    await signin(data.phoneNumber, data.password);
  };
  return (
    <Box className="formContainer">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ minWidth: 400 }}>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
            p={3}
          >
            <Grid item xs>
              <Avatar alt="VBV" src={logo} className="avatar" />
            </Grid>
            <Grid item xs>
              <Typography className="title" variant="h5" component="h4">
                微帮微商家仓库管理
              </Typography>
            </Grid>
            <Grid item container direction="column" p={3} pt={6}>
              <Grid item xs pb={3}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="电话号码"
                      variant="outlined"
                      size="small"
                      type="tel"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs>
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="密码"
                      variant="outlined"
                      size="small"
                      type="password"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs p={4}>
                <Button variant="contained" size="large" type="submit">
                  登录
                </Button>
              </Grid>
              <Grid item xs p={1}>
                <Link to="/signup">
                  <Button>前往注册</Button>
                </Link>
              </Grid>
            </Grid>
            {/* <Grid item xs>
              <Divider>
                <Typography fontSize={10}>其他登录</Typography>
              </Divider>
            </Grid>
            <Grid item xs p={8}></Grid> */}
          </Grid>
        </Card>
      </form>
    </Box>
  );
}
