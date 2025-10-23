import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as loginService, logout as logoutService, getProfile, User } from "../services/auth";

interface AuthContextType {
  user: User | null;
  login: (data: { email?: string; password?: string; CI?: string; role: "admin" | "alumno" }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile().then(setUser).catch(() => setUser(null));
    }
  }, []);

  const login = async (data: { email?: string; password?: string; CI?: string; role: "admin" | "alumno" }) => {
    const userData = await loginService(data);
    setUser(userData);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
