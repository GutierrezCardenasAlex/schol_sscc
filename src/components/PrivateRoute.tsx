import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  allowedRoles?: Array<"admin" | "alumno">;
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <Outlet />;
};

export default PrivateRoute;
