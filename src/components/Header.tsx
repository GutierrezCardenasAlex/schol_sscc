// // src/components/Header.tsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getProfile, User } from "../services/auth";

// const Header: React.FC = () => {
//   const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);
  
//     useEffect(() => {
//       getProfile()
//         .then((data) => setUser(data))
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }, []);
//   return (
//     <header className="flex justify-between items-center mb-2">
//       <img
//           src="/logo.jpg"
//           alt="Logo"
//           className="w-16 h-16 object-cover rounded-full"
//         />
//       {user && (
//             <h2 className="text-xl text-gray-600 mb-2">
//               Bienvenido,{" "}
//               <span className="font-semibold text-blue-600">{user.name}</span>
//             </h2>
//           )}
//       <Link
//         to="/login"
//         className="text-indigo-600 hover:text-indigo-800 font-medium"
//       >
//         Cerrar Sesión
//       </Link>
//     </header>
//   );
// };

// export default Header;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, User } from "../services/auth";
import { LogOut, User as UserIcon, ShieldCheck, GraduationCap } from "lucide-react";

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((data) => setUser(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === "admin";
  const isAlumno = user?.role === "alumno";

  return (
    <header className="flex justify-between items-center bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-sm mb-6 transition-all">
      {/* Sección del Logo e Identidad */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-12 h-12 object-cover rounded-full ring-2 ring-indigo-100 shadow-sm"
          />
        </div>
        
        {!loading && user && (
          <div className="flex flex-col">
            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>Bienvenido,</span>
              <span className="text-indigo-600">{user.name}</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAdmin ? (
                <>
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>Administrador</span>
                </>
              ) : (
                <>
                  <GraduationCap size={14} className="text-indigo-600" />
                  <span>Estudiante</span>
                </>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-lg" />
        )}
      </div>

      {/* Botón de Cerrar Sesión */}
      <Link
        to="/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all duration-200 shadow-sm"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </Link>
    </header>
  );
};

export default Header;