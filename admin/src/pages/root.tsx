import React, { Suspense } from "react";
import AuthProvider from "../contexts/AuthProvider";
import { useOutlet, useLoaderData, Await } from "react-router-dom";
import { LinearProgress } from "@mui/material";

export default function Root() {
  const outlet = useOutlet();
  const { userPromise } = useLoaderData() as any;
  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userPromise}
        children={(user) => (
          <AuthProvider userData={user}>{outlet}</AuthProvider>
        )}
      />
    </Suspense>
  );
}
