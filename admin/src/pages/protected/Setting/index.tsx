import React from "react";
import { CustomizedSwitch, PhoneInput } from "../../../components/index";
import { TextField, Grid, Typography, Button, Divider } from "@mui/material";
import { saveSetting } from "../../../api/index";
import { Status, snackMessage, countryCodes } from "../../../constant/index";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";

const Setting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = React.useState();
  const [tel, setTel] = React.useState(user.phoneNumber || "");
  const [verifyCode, setVerifyCode] = React.useState("");
  const [smsService, setSmsService] = React.useState(user);
  const [emailService, setEmailService] = React.useState(user.setting);
  const [isSmsSending, setIsSmsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [phoneSigned, setPhoneSigned] = React.useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const result = await saveSetting(smsService, emailService);
  };

  return (
    <Grid container flex={1} item p={4} spacing={3}>
      <Grid item xs={12} textAlign="left">
        <Typography variant="h5" component="label">
          设置
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="fullWidth" flexItem />
      </Grid>
      <Grid container item spacing={5}>
        <Grid item xs={2}>
          <div className="textBox">
            <Typography variant="subtitle2" component="label">
              微信用户名:
            </Typography>
          </div>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="body2" component="label">
            {user.name}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="subtitle2" component="label">
            电子邮箱:
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="body2" component="label">
            {user.email}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="subtitle2" component="label">
            电话:
          </Typography>
        </Grid>
        <Grid item xs={10} className="phone">
          <div className="upperBox">
            <PhoneInput
              value={tel}
              // onChangeCountryCode={(e) =>
              //   setCountryCode(countryCodes[e.target.value])
              // }
              onChange={(value) => setTel(value)}
            />
            {/* {storagePhone !== tel && (
                  <Button
                    className="btn verify"
                    disabled={isSmsSending || phoneSigned}
                  >
                    {isSmsSending ? "重新发送 " + 11 + " 秒" : "发送"}
                  </Button>
                )} */}
          </div>
          {isVerifying && (
            <div className="lowerBox">
              <TextField
                id="verifyCode"
                className="input"
                value={verifyCode}
                variant="outlined"
                size="small"
                inputProps={{
                  maxLength: "6",
                }}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
              <Button className="btn verify">确认</Button>
            </div>
          )}
        </Grid>
        <Grid item xs={2} className="sms">
          <Typography variant="body2" component="label">
            新订单短信提醒
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <CustomizedSwitch
            checked={smsService}
            onChange={(e) => setSmsService(e.target.checked)}
            name="checkedSMS"
            disabled
            // disabled={storagePhone && storageCountryCode ? false : true}
          />
        </Grid>
        <Grid item xs={2} className="email">
          <Typography variant="body2" component="label">
            新订单邮箱提醒
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <CustomizedSwitch
            checked={emailService}
            onChange={(e) => setEmailService(e.target.checked)}
            // disabled={storageEmail ? false : true}
            name="checkedEmail"
          />
        </Grid>
        <Grid item xs={3}>
          <Button type="submit" className="btn submit" variant="contained">
            保存更改
          </Button>
        </Grid>
        <Grid item xs={9}></Grid>
      </Grid>
    </Grid>
  );
};

export default Setting;
