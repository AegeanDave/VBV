import React from "react";
import "./App.css";
import PrivateRoute from "./pages/PrivateRoute";
import ReactGA from "react-ga";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Routes, Route } from "react-router-dom";
import AuthProvider, { RequireAuth } from "./contexts/AuthProvider";
import { SnackbarProvider } from "notistack";
import Layout from "./pages/PrivateRoute/Layout";

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <PrivateRoute />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </SnackbarProvider>
  );
}
