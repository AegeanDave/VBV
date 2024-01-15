import { useState } from "react";
import Button from "@mui/material/Button";
import {
  TextField,
  FormControl,
  Select,
  Grid,
  MenuItem,
  InputLabel,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import useVerificationCode from "../../../hooks/useVerificationCode";
import { sendSecondaryVerificationCode, secondaryVerify } from "../../../api";
import { useSnackbar } from "notistack";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FormDialog({ open, onClose }: Props) {
  const [verifySent, setVerifySent] = useState(false);
  const { sendCode, isSendingCode, countdown } = useVerificationCode();
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      areaCode: 1,
      phoneNumber: "",
      verificationCode: "",
    },
  });
  const onSubmit = async (data: any) => {
    try {
      await secondaryVerify(data);
      enqueueSnackbar("验证成功", { variant: "success" });
    } catch (err) {
      console.log(err);
      enqueueSnackbar("验证失败", { variant: "error" });
    } finally {
      onClose();
    }
  };
  const handleSentVerificationCode = async () => {
    sendCode();
    try {
      await sendSecondaryVerificationCode(
        watch("areaCode"),
        watch("phoneNumber")
      );
      setVerifySent(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogTitle>请输入手机号</DialogTitle>
      <DialogContent>
        <DialogContentText>
          此电话将用于接受订单通知，验证成功后将可接收订单通知
        </DialogContentText>
        <Grid item xs pt={2} pb={2} container>
          <Controller
            name="areaCode"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl sx={{ mr: 1, minWidth: 80 }} size="small">
                <InputLabel id="area-code-label">区号</InputLabel>
                <Select
                  {...field}
                  labelId="area-code-label"
                  size="small"
                  autoWidth
                  disabled={isSendingCode}
                  label="区号"
                >
                  <MenuItem value={1}>+1</MenuItem>
                  <MenuItem value={86}>+86</MenuItem>
                </Select>
              </FormControl>
            )}
          ></Controller>
          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl sx={{ flex: 1 }} size="small">
                <TextField
                  {...field}
                  label="电话号码"
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 10 }}
                  type="tel"
                  disabled={isSendingCode}
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        sx={{
                          minWidth: "80px",
                        }}
                        variant="contained"
                        onClick={handleSentVerificationCode}
                        disabled={isSendingCode}
                      >
                        验证 {isSendingCode && countdown}
                      </Button>
                    ),
                  }}
                />
              </FormControl>
            )}
          />
        </Grid>
        {verifySent && (
          <Controller
            name="verificationCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="验证码"
                size="small"
                inputProps={{ maxLength: 6 }}
              />
            )}
          ></Controller>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          type="submit"
          disabled={!watch("verificationCode")}
          variant="contained"
        >
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
}
