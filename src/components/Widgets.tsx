// import React, { useEffect, useState } from "react";
// import { getProfile, User } from "../services/auth";
// import { BookOpen, Users, ClipboardCheck, Award } from "lucide-react";

// interface WidgetsProps {
//   minHeight?: string; // <-- nuevo prop opcional
// }

// const Widgets: React.FC<WidgetsProps> = ({ minHeight }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getProfile()
//       .then((data) => setUser(data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
//       </div>
//     );

//   return (
//     <div
//         style={{ minHeight: "80vh" }}
//         className="bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center"
//       >
//       <div className="max-w-5xl w-full p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 text-center">
//         {/* Encabezado con saludo */}
//         <div className="mb-8">
          
//           <h1 className="text-4xl font-extrabold text-gray-800">
//             Sistema de Exámenes — Colegio SSCC
//           </h1>
//           <p className="text-gray-600 text-lg mt-3 max-w-3xl mx-auto">
//   Bienvenido al sistema de evaluación en línea del{" "}
//   <a
//     href="https://www.sagradoscorazonesa.org"
//     target="_blank"
//     rel="noopener noreferrer"
//     className="font-semibold text-blue-600 hover:underline hover:text-blue-800 transition-colors"
//   >
//     Colegio Sagrados Corazones (SSCC)
//   </a>.  
//   Aquí podrás gestionar, rendir y calificar exámenes de manera rápida,
//   organizada y segura.
// </p>

//         </div>

//         {/* Sección de widgets informativos */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
//           <div className="bg-blue-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
//             <BookOpen className="text-blue-600 w-10 h-10 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-gray-800">
//               Gestión de Materias
//             </h3>
//             <p className="text-gray-500 text-sm mt-2">
//               Administra las asignaturas y exámenes de cada curso con facilidad.
//             </p>
//           </div>

//           <div className="bg-purple-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
//             <Users className="text-purple-600 w-10 h-10 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-gray-800">
//               Usuarios y Roles
//             </h3>
//             <p className="text-gray-500 text-sm mt-2">
//               Control total sobre profesores, alumnos y administradores.
//             </p>
//           </div>

//           <div className="bg-green-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
//             <ClipboardCheck className="text-green-600 w-10 h-10 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-gray-800">
//               Exámenes Online
//             </h3>
//             <p className="text-gray-500 text-sm mt-2">
//               Evalúa conocimientos mediante pruebas seguras y automáticas.
//             </p>
//           </div>

//           <div className="bg-yellow-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
//             <Award className="text-yellow-600 w-10 h-10 mx-auto mb-3" />
//             <h3 className="text-lg font-semibold text-gray-800">
//               Resultados y Reportes
//             </h3>
//             <p className="text-gray-500 text-sm mt-2">
//               Visualiza los resultados y analiza el rendimiento académico.
//             </p>
//           </div>
//         </div>

//         {/* Pie de página */}
//         <div className="mt-10 border-t border-gray-200 pt-4 text-sm text-gray-500">
//           <p>
//             © {new Date().getFullYear()} Colegio SSCC — Sistema de Exámenes.  
//             Desarrollado para optimizar la gestión académica.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Widgets;

import React, { useEffect, useState } from "react";
import { getProfile, User } from "../services/auth";
import { BookOpen, Users, ClipboardCheck, Award, ExternalLink, Sparkles } from "lucide-react";

interface WidgetsProps {
  minHeight?: string;
}

const Widgets: React.FC<WidgetsProps> = ({ minHeight = "80vh" }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((data) => setUser(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 bg-slate-50 rounded-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );

  return (
    <div
      style={{ minHeight }}
      className="bg-slate-50/50 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center border border-slate-100 shadow-sm"
    >
      <div className="max-w-5xl w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 text-center transition-all">
        
        {/* Insignia / Bienvenida Superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles size={14} /> Panel Principal
        </div>

        {/* Encabezado Principal */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Sistema de Exámenes — Colegio SSCC
          </h1>
          <p className="text-slate-500 text-base md:text-lg mt-3 max-w-3xl mx-auto leading-relaxed">
            Bienvenido al sistema de evaluación en línea del{" "}
            <a
              href="https://www.sagradoscorazonesa.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors underline underline-offset-4"
            >
              Colegio Sagrados Corazones (SSCC)
              <ExternalLink size={14} />
            </a>
            . Aquí podrás gestionar, rendir y calificar exámenes de manera rápida, organizada y segura.
          </p>
        </div>

        {/* Sección de Widgets Informativos (Tarjetas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6 text-left hover:bg-white hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BookOpen size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Gestión de Materias
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Administra las asignaturas y exámenes de cada curso con facilidad.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6 text-left hover:bg-white hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Usuarios y Roles
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Control total sobre profesores, alumnos y administradores.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6 text-left hover:bg-white hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ClipboardCheck size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Exámenes Online
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Evalúa conocimientos mediante pruebas seguras y automáticas.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-6 text-left hover:bg-white hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Award size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Resultados y Reportes
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Visualiza los resultados y analiza el rendimiento académico.
            </p>
          </div>
        </div>

        {/* Pie de página institucional */}
        <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400 font-medium">
          <p>
            © {new Date().getFullYear()} Colegio SSCC — Sistema de Exámenes. Desarrollado para optimizar la gestión académica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Widgets;