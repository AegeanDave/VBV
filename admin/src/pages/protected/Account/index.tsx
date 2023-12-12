import React from "react";
import { Box, Typography, Grid } from "@mui/material";

const Account = () => {
  return (
    <Box className="blocker" width="100%" height="100vh">
      <Grid container p={4}>
        <Grid item textAlign="center" xs={12}>
          <Typography variant="h5">您暂未开通插件</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Account;
