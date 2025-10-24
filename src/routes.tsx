// src/routes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import ExamenView from "./components/ExamenView";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          <Route element={<PrivateRoute allowedRoles={["admin", "alumno"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["admin", "alumno"]} />}>
            <Route path="/examen-view" element={<ExamenView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
