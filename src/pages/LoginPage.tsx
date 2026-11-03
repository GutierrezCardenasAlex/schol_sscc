// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Swal from "sweetalert2";
// import { Users, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

// const LoginPage = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [role, setRole] = useState<"admin" | "alumno" | "">("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [CI, setCI] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       Swal.fire({
//         title: "Iniciando sesión...",
//         allowOutsideClick: false,
//         didOpen: () => Swal.showLoading(),
//       });

//       if (role === "admin") {
//         await login({ email, password, role });
//       } else if (role === "alumno") {
//         await login({ CI, role });
//       }

//       Swal.fire({
//         icon: "success",
//         title: "¡Bienvenido!",
//         text: `Has iniciado sesión como ${role}`,
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       navigate("/dashboard");
//     } catch (err: any) {
//       console.error(err);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text:
//           err.response?.data?.message ||
//           err.message ||
//           "No se pudo conectar con el servidor",
//       });
//     }
//   };

//   if (!role) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-200 text-gray-700">
//         <h2 className="text-3xl font-bold mb-6">Selecciona tipo de usuario</h2>
//         <div className="flex gap-4">
//           <button
//             onClick={() => setRole("admin")}
//             className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-6 rounded shadow hover:bg-gray-100 transition"
//           >
//             <Users size={20} /> Admin
//           </button>
//           <button
//             onClick={() => setRole("alumno")}
//             className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-6 rounded shadow hover:bg-gray-100 transition"
//           >
//             <FileSpreadsheet size={20} /> Estudiante
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-200">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-lg shadow-lg w-96 flex flex-col gap-6"
//       >
//         <h2 className="text-2xl font-bold text-center text-gray-800">
//           {/* Login {role.charAt(0).toUpperCase() + role.slice(1)} */}
//           Login {role === 'alumno' ? 'Estudiante' : role.charAt(0).toUpperCase() + role.slice(1)}
//         </h2>

//         {role === "admin" && (
//           <>
//             <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
//               <Users size={20} className="text-gray-400" />
//               <input
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="flex-1 outline-none"
//                 required
//               />
//             </div>
//             <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
//               <AlertCircle size={20} className="text-gray-400" />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="flex-1 outline-none"
//                 required
//               />
//             </div>
//           </>
//         )}

//         {role === "alumno" && (
//           <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
//             <FileSpreadsheet size={20} className="text-gray-400" />
//             <input
//               placeholder="CI"
//               value={CI}
//               onChange={(e) => setCI(e.target.value)}
//               className="flex-1 outline-none"
//               required
//             />
//           </div>
//         )}

//         <button
//           type="submit"
//           className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-indigo-700 transition"
//         >
//           <CheckCircle size={20} /> Ingresar
//         </button>

//         <button
//           type="button"
//           onClick={() => setRole("")}
//           className="text-indigo-600 text-center hover:underline mt-2"
//         >
//           Cambiar tipo de usuario
//         </button>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { Users, FileSpreadsheet, CheckCircle, AlertCircle, Lock, ArrowLeft, Mail, IdCard } from "lucide-react";

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
        text: `Has iniciado sesión como ${role === "alumno" ? "estudiante" : role}`,
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

  // Pantalla de Selección de Rol
  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 text-center transition-all">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Users size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Bienvenido
          </h2>
          <p className="text-slate-500 text-sm mt-1 mb-8">
            Selecciona tu tipo de usuario para ingresar al sistema
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setRole("admin")}
              className="group flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-slate-200 text-slate-700 font-semibold p-5 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all duration-200 shadow-sm"
            >
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <Users size={24} className="text-indigo-600" />
              </div>
              <span>Administrador</span>
            </button>

            <button
              onClick={() => setRole("alumno")}
              className="group flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-slate-200 text-slate-700 font-semibold p-5 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all duration-200 shadow-sm"
            >
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={24} className="text-indigo-600" />
              </div>
              <span>Estudiante</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Formulario de Login
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6 border border-slate-100 transition-all"
      >
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Login {role === "alumno" ? "Estudiante" : role.charAt(0).toUpperCase() + role.slice(1)}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Ingresa tus credenciales a continuación
          </p>
        </div>

        {/* Campos para Admin */}
        {role === "admin" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Correo Electrónico
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2.5 gap-3 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Contraseña
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2.5 gap-3 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Campos para Alumno */}
        {role === "alumno" && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Carnet de Identidad (CI)
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl px-3.5 py-2.5 gap-3 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
              <IdCard size={18} className="text-slate-400" />
              <input
                placeholder="Ingresa tu CI"
                value={CI}
                onChange={(e) => setCI(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
                required
              />
            </div>
          </div>
        )}

        {/* Botón Ingresar */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 mt-2"
        >
          <CheckCircle size={18} /> Ingresar
        </button>

        {/* Botón Regresar */}
        <button
          type="button"
          onClick={() => setRole("")}
          className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors mt-1"
        >
          <ArrowLeft size={16} /> Cambiar tipo de usuario
        </button>
      </form>
    </div>
  );
};

export default LoginPage;