import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useAuth } from "../../../contexts/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <Box width="100vw" height="100vh">
      <Grid container spacing={3} p={4}>
        <Grid item xs={12}>
          <Typography variant="h4">
            欢迎用户{user.loginPhoneNumber}来到微帮微
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
