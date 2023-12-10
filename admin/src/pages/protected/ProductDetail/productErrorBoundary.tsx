import React from "react";
import { Box, Grid } from "@mui/material";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ProductErrorBoundary() {
  let error = useRouteError();
  // We only care to handle 401's at this level, so if this is not a 401
  // ErrorResponse, re-throw to let the RootErrorBoundary handle it
  if (!isRouteErrorResponse(error) || error.status !== 404) {
    throw error;
  }

  return (
    <Box width="100vw" height="100vh">
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <h1>We can not found this product</h1>
        <p>
          Please reach out to{" "}
          <a href={`mailto:${error.data.contactEmail}`}>
            {error.data.contactEmail}
          </a>{" "}
          to get more details.
        </p>
      </Grid>
    </Box>
  );
}
