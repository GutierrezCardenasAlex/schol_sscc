// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  allowedRoles?: ("admin" | "alumno")[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />; // No logueado
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />; // Rol no permitido

  return <Outlet />;
};

export default PrivateRoute;
