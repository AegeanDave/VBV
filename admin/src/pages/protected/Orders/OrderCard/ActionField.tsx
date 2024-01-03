import React from "react";
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material/";
import { actions, OrderStatus, carriers } from "../../../../constant/index";
import { Edit, ExpandMore } from "@mui/icons-material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useOrder } from "../../../../contexts/OrderProvider";

interface Props {
  order: any;
}

export default function ShippingAction({ order }: Props) {
  const { onShipping, onCancelling } = useOrder();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      carrier: "",
      trackingNum: "",
    },
  });

  const onSubmit = async (data) => {
    onShipping(order, data);
  };

  return (
    <Grid item xs={12} pt={2}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={1}>
          <Controller
            name="carrier"
            control={control}
            render={({ field }) => (
              <FormControl sx={{ width: 110 }} size="small">
                <InputLabel id="demo-simple-select-label">运输公司</InputLabel>
                <Select
                  {...field}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="运输公司"
                  autoWidth
                >
                  {Object.values(carriers).map((carrier: any) => (
                    <MenuItem key={carrier.key} value={carrier.key}>
                      {carrier.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="trackingNum"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="快递单号"
                size="small"
                sx={{ flex: 1 }}
              />
            )}
          />
        </Stack>
        <Stack pt={2}>
          <Button variant="contained" size="large" type="submit">
            提交发货
          </Button>
          <Button color="error">拒绝</Button>
        </Stack>
      </form>
    </Grid>
  );
}
