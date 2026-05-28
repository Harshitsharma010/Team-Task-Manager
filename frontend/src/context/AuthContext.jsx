/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function readStoredAuth() {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!storedToken || !storedUser) return { user: null, token: null };

  try {
    return { user: JSON.parse(storedUser), token: storedToken };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const login = (userData, jwt) => {
    const user = { ...userData, id: userData.id?.toString() || userData._id?.toString() };
    setAuth({ user, token: jwt });
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", jwt);
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
