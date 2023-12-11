import React from "react";
import { CustomizedSwitch, CustomizedSelect } from "../../../components/index";
import { TextField, Grid, Typography, Button } from "@mui/material";
import {
  sendSMSVerifcation,
  verification,
  saveSetting,
} from "../../../api/index";
import { Status, snackMessage, countryCodes } from "../../../constant/index";
import { SnackBarProps } from "../../../models/index";
import { useNavigate } from "react-router-dom";
import "./style.scss";

interface Props {
  snackOpen: (snackInfo: SnackBarProps) => void;
  openBackdrop: () => void;
  closeBackdrop: () => void;
}

const Setting = ({ snackOpen, closeBackdrop, openBackdrop }: Props) => {
  const storageSMS = localStorage.getItem("smsService") === "true";
  const storageEmail = localStorage.getItem("emailService") === "true";
  const storagePhone = localStorage.getItem("phone");
  const storageCountryCode = localStorage.getItem("countryCode");
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = React.useState(
    !storageCountryCode ? countryCodes["CN"] : countryCodes[storageCountryCode]
  );
  const [tel, setTel] = React.useState(storagePhone || "");
  const [verifyCode, setVerifyCode] = React.useState("");
  const [smsService, setSmsService] = React.useState(storageSMS);
  const [emailService, setEmailService] = React.useState(storageEmail);
  const [isSmsSending, setIsSmsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [phoneSigned, setPhoneSigned] = React.useState(false);
  const [clock, setClock] = React.useState(59);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const result = await saveSetting(smsService, emailService);
    if (result.data.status === Status.SUCCESS) {
      snackOpen(snackMessage.success.edit);
      navigate("/", { replace: true });
    } else {
      snackOpen(snackMessage.error.edit);
    }
  };
  const handleCounting = () => {
    let currentTime = clock;
    let siv = setInterval(() => {
      setClock(currentTime--);
      if (currentTime <= -1) {
        clearInterval(siv); //倒计时( setInterval() 函数会每秒执行一次函数)，用 clearInterval() 来停止执行:
        setClock(59);
        setIsSmsSending(false);
      }
    }, 1000);
  };
  const handleSendVerificationCode = async (e: any) => {
    setIsSmsSending(true);
    setIsVerifying(true);
    e.preventDefault();
    clock !== 0 && handleCounting();
    if (!isSmsSending) {
      sendSMSVerifcation({
        countryCode: countryCode.key,
        tel,
      });
    }
  };
  const handleVerification = async () => {
    const result = await verification(verifyCode);
    if (result.data.status === Status.SUCCESS) {
      snackOpen(snackMessage.success.verify);
      setPhoneSigned(true);
      setIsSmsSending(false);
      setClock(59);
      localStorage.setItem("countryCode", countryCode);
      localStorage.setItem("phone", tel);
    } else {
      snackOpen(snackMessage.error.verify);
    }
    setIsVerifying(false);
  };
  return (
    <div className="setting">
      <div className="header">
        <Typography variant="h5" component="label">
          设置
        </Typography>
      </div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={5} className="formBox">
          <Grid item xs={2}>
            <div className="textBox">
              <Typography variant="body2" component="label">
                微信用户名:
              </Typography>
            </div>
          </Grid>
          <Grid item xs={10}>
            <Typography variant="body2" component="label">
              {localStorage.getItem("name")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              电子邮箱:
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Typography variant="body2" component="label">
              {localStorage.getItem("email")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" component="label">
              电话:
            </Typography>
          </Grid>
          <Grid item xs={10} className="phone">
            <div>
              <div className="upperBox">
                <CustomizedSelect
                  countryCode={countryCode}
                  tel={tel}
                  disabled={phoneSigned}
                  onChangeCountryCode={(e) =>
                    setCountryCode(countryCodes[e.target.value])
                  }
                  onChangeTel={(e) => setTel(e.target.value)}
                />
                {isSmsSending}
                {storagePhone !== tel && (
                  <Button
                    onClick={(e) => handleSendVerificationCode(e)}
                    className="btn verify"
                    disabled={isSmsSending || phoneSigned}
                  >
                    {isSmsSending ? "重新发送 " + clock + " 秒" : "发送"}
                  </Button>
                )}
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
                  <Button className="btn verify" onClick={handleVerification}>
                    确认
                  </Button>
                </div>
              )}
            </div>
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
              disabled={storageEmail ? false : true}
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
      </form>
    </div>
  );
};

export default Setting;
