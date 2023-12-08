import React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { login, logout } from "../api";
import axios from "axios";
import { useSnackbar } from "notistack";
import { getStorage, setStorage } from "../utils/localStorage";

interface AuthContextType {
  user: any;
  signin: (phoneNumber: string, password: string) => void;
  signout: () => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const authStorage = getStorage();
  if (!auth.user && !authStorage.sessionKey) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(null);
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
      setStorage(result.data);
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
    navigate("/login");
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export { useAuth, RequireAuth };
