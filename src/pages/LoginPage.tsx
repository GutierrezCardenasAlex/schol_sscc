import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { Users, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"admin" | "alumno" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [CI, setCI] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Iniciando sesión...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      if (role === "admin") {
        await login({ email, password, role });
      } else if (role === "alumno") {
        await login({ CI, role });
      }

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Has iniciado sesión como ${role}`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "No se pudo conectar con el servidor",
      });
    }
  };

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200 text-gray-700">
        <h2 className="text-3xl font-bold mb-6">Selecciona tipo de usuario</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setRole("admin")}
            className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-6 rounded shadow hover:bg-gray-100 transition"
          >
            <Users size={20} /> Admin
          </button>
          <button
            onClick={() => setRole("alumno")}
            className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-6 rounded shadow hover:bg-gray-100 transition"
          >
            <FileSpreadsheet size={20} /> Alumno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-96 flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Login {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>

        {role === "admin" && (
          <>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <Users size={20} className="text-gray-400" />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 outline-none"
                required
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <AlertCircle size={20} className="text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none"
                required
              />
            </div>
          </>
        )}

        {role === "alumno" && (
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
            <FileSpreadsheet size={20} className="text-gray-400" />
            <input
              placeholder="CI"
              value={CI}
              onChange={(e) => setCI(e.target.value)}
              className="flex-1 outline-none"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-indigo-700 transition"
        >
          <CheckCircle size={20} /> Ingresar
        </button>

        <button
          type="button"
          onClick={() => setRole("")}
          className="text-indigo-600 text-center hover:underline mt-2"
        >
          Cambiar tipo de usuario
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
