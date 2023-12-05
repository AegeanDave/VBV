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
import { useNavigate, useLocation } from "react-router-dom";

type IFormInput = {
  phoneNumber: string;
  password: string;
};

export default function Login() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { control, handleSubmit } = useForm({
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });
  const onSubmit = async (data: IFormInput) => {
    try {
      await signin(data.phoneNumber, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Box className="formContainer">
      <Card sx={{ minWidth: 400 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
          >
            <Grid item xs>
              <Avatar alt="VBV" src={logo} className="avatar" />
            </Grid>
            <Grid item xs>
              <Typography className="title" variant="h5" component="h4">
                微帮微商家仓库管理
              </Typography>
            </Grid>
            <Grid item xs p={4}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="电话号码"
                    variant="outlined"
                    size="small"
                    type="tel"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="密码"
                    variant="outlined"
                    size="small"
                    type="password"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs p={4}>
              <Button variant="contained" size="large" type="submit">
                登录
              </Button>
            </Grid>
            <Grid item xs>
              <Divider>
                <Typography fontSize={10}>其他登录</Typography>
              </Divider>
            </Grid>
            <Grid item xs p={8}></Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}
