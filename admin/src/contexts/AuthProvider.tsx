import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { login } from "../api";
import axios from "axios";

interface AuthContextType {
  user: any;
  signin: (phoneNumber: string, password: string) => void;
  signout: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
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

  const signin = async (phoneNumber: string, password: string) => {
    const result = await login({ phoneNumber, password });
    if (!result.data) {
      throw new Error();
    }
    localStorage.setItem("sessionKey", result.data.sessionKey);
    localStorage.setItem("name", result.data.name);
    localStorage.setItem("email", result.data.email);
    result.data.countryCode &&
      localStorage.setItem(
        "countryCode",
        result.data.notificationPhoneNumberCountryCode
      );
    result.data.phone &&
      localStorage.setItem("phone", result.data.notificationPhoneNumber);
    localStorage.setItem("smsService", result.data.smsService);
    localStorage.setItem("emailService", result.data.emailService);
    axios.defaults.headers.common = { authorization: result.data.sessionKey };
    setUser(result.data);
  };

  const signout = () => {};

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export { useAuth, RequireAuth };
