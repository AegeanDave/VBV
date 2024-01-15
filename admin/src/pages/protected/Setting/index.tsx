import React from "react";
import { CustomizedSwitch } from "../../../components/index";
import { Grid, Typography, Button, Divider, Tooltip } from "@mui/material";
import { saveSetting } from "../../../api/index";
import { useAuth } from "../../../contexts/AuthProvider";
import FormDialog from "./SecondaryPhoneDialog";

const Setting = () => {
  const { user } = useAuth();
  const [smsService, setSmsService] = React.useState(user);
  const [emailService, setEmailService] = React.useState(user.setting);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const onOpenDialog = () => {
    setDialogOpen(true);
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const result = await saveSetting(smsService, emailService);
  };

  return (
    <>
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
              {user.username}
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
            <Tooltip title="此电话将用于接受订单通知，默认为登录电话">
              <Typography variant="subtitle2" component="label">
                提醒电话:
              </Typography>
            </Tooltip>
          </Grid>
          {user.secondaryPhoneNumber ? (
            <>
              <Grid item xs={10} className="phone">
                <Typography variant="body2">
                  {user.secondaryPhoneNumber}
                </Typography>
                <Button onClick={onOpenDialog} size="small">
                  更改电话
                </Button>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={10}>
                <Button onClick={onOpenDialog}>添加提醒电话</Button>
              </Grid>
            </>
          )}
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
      <FormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      ></FormDialog>
    </>
  );
};

export default Setting;
