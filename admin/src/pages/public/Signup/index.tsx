import React from "react";
import logo from "../../../assets/images/logo.png";
import {
  Avatar,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  Button,
  Divider,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { countryCodes } from "../../../constant/index";
import "./style.scss";
import { getVerificationCode, signup } from "../../../api";
import { useSnackbar } from "notistack";
import useVerificationCode from "../../../hooks/useVerificationCode";
import { useNavigate } from "react-router-dom";

interface IFormInput {
  phoneNumber: string;
  countryCode: string;
  verificationCode: string;
  password: string;
  confirmedPass: string;
}

export default function Signup() {
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      countryCode: "",
      phoneNumber: "",
      verificationCode: "",
      password: "",
      confirmedPass: "",
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { sendCode, isSendingCode, countdown } = useVerificationCode();
  const watchFields = watch();

  const handleGetVerification = async () => {
    const todo = await trigger("phoneNumber");
    if (!todo) return;
    sendCode();
    const result = await getVerificationCode(
      watchFields.countryCode,
      watchFields.phoneNumber
    );
    if (result?.data.status === "FAIL") {
      enqueueSnackbar(result.data.message, { variant: "info" });
      return;
    }
    enqueueSnackbar("验证码已发送");
  };

  const onSubmit = async (data: IFormInput) => {
    try {
      const result = await signup(data);
      if (result.data.status === "FAIL") {
        enqueueSnackbar(result.data.message);
        return;
      }
      enqueueSnackbar("创建成功");
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err);
      enqueueSnackbar("创建失败，请检查网络");
    }
  };

  return (
    <Box className="formContainer">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
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
            <Grid item xs pb={4}>
              <Typography className="title" variant="h5" component="h4">
                微帮微商家仓库注册
              </Typography>
            </Grid>
            <Grid item container direction="column">
              <Grid item xs container direction="row" alignItems="center" p={1}>
                <FormControl
                  className="countryCode"
                  sx={{ mr: 2, minWidth: 80 }}
                  size="small"
                >
                  <InputLabel id="countryCodeLabel">区号</InputLabel>
                  <Controller
                    name="countryCode"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="区号"
                        labelId="countryCodeLabel"
                        renderValue={(value) => value}
                      >
                        {countryCodes.map((countryCode: any) => (
                          <MenuItem
                            value={countryCode.value}
                            key={countryCode.key}
                          >
                            + {countryCode.value} {countryCode.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText> </FormHelperText>
                </FormControl>
                <Grid item flex={1}>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{ required: true, minLength: 10, maxLength: 11 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="手机号码"
                        placeholder=""
                        helperText={errors.phoneNumber ? "手机号码有误" : " "}
                        error={!!errors.phoneNumber}
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item xs p={1} pt={0}>
                <Controller
                  name="verificationCode"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="验证码"
                      size="small"
                      fullWidth
                      inputProps={{ maxLength: 6 }}
                      InputProps={{
                        endAdornment: (
                          <Button
                            size="small"
                            sx={{ minWidth: isSendingCode ? 140 : 78 }}
                            disabled={
                              !watchFields.countryCode ||
                              !watchFields.phoneNumber ||
                              isSendingCode
                            }
                            onClick={handleGetVerification}
                          >
                            {isSendingCode
                              ? `下次获取时间 ${countdown}秒`
                              : "获取验证码"}
                          </Button>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item p={3}>
                <Divider></Divider>
              </Grid>
              <Grid item xs p={1}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: true,
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="密码"
                      helperText="长度至少为8个字符，
                      必须包含至少一个字母，
                      必须包含至少一个数字。"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs p={1}>
                <Controller
                  name="confirmedPass"
                  control={control}
                  rules={{
                    required: true,
                    validate: (value, formValues) =>
                      value === formValues.password,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="确认密码"
                      helperText={errors.confirmedPass ? "密码不一致" : " "}
                      error={!!errors.confirmedPass}
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid item xs p={4}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  !watchFields.verificationCode ||
                  !watchFields.password ||
                  !watchFields.confirmedPass
                }
              >
                创建帐号
              </Button>
            </Grid>
          </Grid>
        </Card>
      </form>
    </Box>
  );
}
