import React, { ReactNode, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, logout } from "../api";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AuthContextType {
  user: any;
  signin: (phoneNumber: string, password: string) => void;
  signout: () => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function useAuth() {
  return React.useContext(AuthContext);
}

interface Props {
  userData: any;
  children: ReactNode;
}
function AuthProvider({ userData, children }: Props) {
  const [user, setUser] = useLocalStorage("user", userData || null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const signin = async (phoneNumber: string, password: string) => {
    try {
      const result = await login({ phoneNumber, password });
      if (!result.data) {
        enqueueSnackbar("用户名或密码有误", { variant: "error" });
        return;
      }
      if (result.data.status === "FAIL") {
        enqueueSnackbar(result.data.message, { variant: "error" });
        return;
      }
      setUser(result.data);
      axios.defaults.headers.common = { authorization: result.data.sessionKey };
      enqueueSnackbar("登录成功", { variant: "success" });
      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
      enqueueSnackbar("网络错误", { variant: "error" });
    }
  };

  const signout = () => {
    logout();
    setUser(null);
    navigate("/login", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      signin,
      signout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
export { useAuth };
