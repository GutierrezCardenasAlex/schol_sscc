// src/context/AuthContext.tsx
import React, { createContext, useState, ReactNode } from "react";
import { login as loginService, logout as logoutService, User } from "../services/auth";

interface AuthContextType {
  user: User | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (data: any) => {
    const userData = await loginService(data);
    setUser(userData);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
