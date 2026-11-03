// import React, { useEffect, useState } from "react";
// import { getProfile, User } from "../services/auth";

// interface SidebarProps {
//   setActiveContent: (content: string) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ setActiveContent }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [showAdminOptions, setShowAdminOptions] = useState(false);

//   useEffect(() => {
//     getProfile().then(setUser).catch(console.error);
//   }, []);

//   if (!user) return <p className="p-4 text-gray-600">Cargando menú...</p>;

//   const isAdmin = user.role === "admin";
//   const isAlumno = user.role === "alumno";

//   return (
//     <aside
//       className={`${
//         isCollapsed ? "w-16" : "w-64"
//       } bg-white shadow-md transition-all duration-300 ease-in-out`}
//     >
//       {/* Botón de colapso */}
//       <button
//         onClick={() => setIsCollapsed(!isCollapsed)}
//         className="p-4 w-full text-gray-700 hover:bg-gray-200 focus:outline-none"
//       >
//         <svg
//           className="h-6 w-6"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M4 6h16M4 12h16m-7 6h7"
//           />
//         </svg>
//       </button>

//       <nav className="mt-6">
//         {/* INICIO */}
//         <SidebarButton
//           icon="home"
//           label="Inicio"
//           collapsed={isCollapsed}
//           onClick={() => setActiveContent("dashboard")}
//         />

//         {/* PERFIL */}
//         <SidebarButton
//           icon="user"
//           label="Perfil"
//           collapsed={isCollapsed}
//           onClick={() => setActiveContent("profile")}
//         />

//         {/* SOLO ADMIN PUEDE VER ESTOS */}
//         {isAdmin && (
//           <>
//             <SidebarButton
//               icon="users"
//               label="Alumnos"
//               collapsed={isCollapsed}
//               onClick={() => setActiveContent("alumnos")}
//             />
//             <SidebarButton
//               icon="users"
//               label="Docentes"
//               collapsed={isCollapsed}
//               onClick={() => setActiveContent("docentes")}
//             />
//             <SidebarButton
//               icon="book"
//               label="Materias"
//               collapsed={isCollapsed}
//               onClick={() => setActiveContent("materias")}
//             />
//             <SidebarButton
//               icon="book"
//               label="Reportes"
//               collapsed={isCollapsed}
//               onClick={() => setActiveContent("reportes")}
//             />

//             {/* ADMINISTRADOR */}
//             <SidebarButton
//               icon="plus"
//               label="Administrador"
//               collapsed={isCollapsed}
//               onClick={() => setShowAdminOptions(!showAdminOptions)}
//             />

//             {showAdminOptions && (
//               <div className="ml-6 border-l border-gray-300">
//                 <SidebarButton
//                   icon="clipboard"
//                   label="Evaluaciones"
//                   collapsed={isCollapsed}
//                   onClick={() => setActiveContent("evaluaciones")}
//                   small
//                 />
//                 {/* <SidebarButton
//                   icon="clipboard-check"
//                   label="Evaluaciones Cursos"
//                   collapsed={isCollapsed}
//                   onClick={() => setActiveContent("evaluacionescursos")}
//                   small
//                 /> */}
//                 <SidebarButton
//                   icon="upload"
//                   label="Importar Excel"
//                   collapsed={isCollapsed}
//                   onClick={() => setActiveContent("importexcel")}
//                   small
//                 />
//               </div>
//             )}
//           </>
//         )}

//         {/* SOLO ALUMNO PUEDE VER SU EXAMEN */}
//         {isAlumno && (
//           <SidebarButton
//             icon="clipboard-check"
//             label="Examen de Curso"
//             collapsed={isCollapsed}
//             onClick={() => setActiveContent("evaluacionescursos")}
//           />
//         )}

//         {/* CONFIGURACIÓN */}
//         <SidebarButton
//           icon="settings"
//           label="Configuración"
//           collapsed={isCollapsed}
//           onClick={() => setActiveContent("settings")}
//         />
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;

// /* --------------------------
//    Componente Reutilizable
// ---------------------------*/
// interface SidebarButtonProps {
//   icon: string;
//   label: string;
//   collapsed: boolean;
//   onClick: () => void;
//   small?: boolean;
// }

// const SidebarButton: React.FC<SidebarButtonProps> = ({
//   icon,
//   label,
//   collapsed,
//   onClick,
//   small = false,
// }) => {
//   const icons: Record<string, JSX.Element> = {
//     home: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0L9 9"
//       />
//     ),
//     user: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//       />
//     ),
//     users: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M17 20h5V8H2v12h5m10-6a2 2 0 11-4 0 2 2 0 014 0z"
//       />
//     ),
//     book: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M12 20h9M12 4H3m9 0v16"
//       />
//     ),
//     plus: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M12 4v16m8-8H4"
//       />
//     ),
//     clipboard: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M8 4h8v4H8V4zM4 8h16v12H4V8z"
//       />
//     ),
//     "clipboard-check": (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M9 12l2 2 4-4m-5-6h8v4H10V4zM4 8h16v12H4V8z"
//       />
//     ),
//     upload: (
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M4 16v4h16v-4M12 12V4m0 0l-4 4m4-4l4 4"
//       />
//     ),
//     settings: (
//       <>
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37"
//         />
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//         />
//       </>
//     ),
//   };

//   return (
//     <button
//       onClick={onClick}
//       className={`flex items-center p-${small ? "3" : "4"} text-gray-700 hover:bg-gray-200 hover:text-indigo-600 w-full ${
//         collapsed ? "justify-center" : ""
//       }`}
//     >
//       <svg
//         className="h-5 w-5 mr-3"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         {icons[icon]}
//       </svg>
//       {!collapsed && label}
//     </button>
//   );
// };

import React, { useEffect, useState } from "react";
import { getProfile, User } from "../services/auth";
import { 
  Home, 
  User as UserIcon, 
  Users, 
  BookOpen, 
  FileText, 
  PlusCircle, 
  ClipboardCheck, 
  Upload, 
  Settings, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ShieldCheck, 
  GraduationCap 
} from "lucide-react";

interface SidebarProps {
  setActiveContent: (content: string) => void;
  activeContent?: string; // Útil para resaltar el botón activo
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveContent, activeContent }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  useEffect(() => {
    getProfile().then(setUser).catch(console.error);
  }, []);

  if (!user) {
    return (
      <aside className="w-64 bg-white border-r border-slate-100 flex items-center justify-center p-4">
        <p className="text-slate-400 text-sm animate-pulse">Cargando menú...</p>
      </aside>
    );
  }

  const isAdmin = user.role === "admin";
  const isAlumno = user.role === "alumno";

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-sm z-20`}
    >
      <div>
        {/* Cabecera del Sidebar con botón de colapso */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-indigo-100">
                {isAdmin ? <ShieldCheck size={18} /> : <GraduationCap size={18} />}
              </div>
              <div className="truncate">
                <span className="block text-sm font-bold text-slate-800 truncate">
                  {user.name || (isAdmin ? "Administrador" : "Estudiante")}
                </span>
                <span className="block text-[11px] font-medium text-indigo-600 uppercase tracking-wider">
                  {user.role === "alumno" ? "Estudiante" : user.role}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all ml-auto"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
          {/* INICIO */}
          <SidebarButton
            icon={<Home size={20} />}
            label="Inicio"
            collapsed={isCollapsed}
            active={activeContent === "dashboard"}
            onClick={() => setActiveContent("dashboard")}
          />

          {/* PERFIL */}
          {/* <SidebarButton
            icon={<UserIcon size={20} />}
            label="Perfil"
            collapsed={isCollapsed}
            active={activeContent === "profile"}
            onClick={() => setActiveContent("profile")}
          /> */}

          {/* SOLO ADMIN */}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1">
                {!isCollapsed && (
                  <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Gestión
                  </p>
                )}
              </div>

              <SidebarButton
                icon={<Users size={20} />}
                label="Alumnos"
                collapsed={isCollapsed}
                active={activeContent === "alumnos"}
                onClick={() => setActiveContent("alumnos")}
              />
              <SidebarButton
                icon={<Users size={20} />}
                label="Docentes"
                collapsed={isCollapsed}
                active={activeContent === "docentes"}
                onClick={() => setActiveContent("docentes")}
              />
              <SidebarButton
                icon={<BookOpen size={20} />}
                label="Materias"
                collapsed={isCollapsed}
                active={activeContent === "materias"}
                onClick={() => setActiveContent("materias")}
              />
              <SidebarButton
                icon={<FileText size={20} />}
                label="Reportes"
                collapsed={isCollapsed}
                active={activeContent === "reportes"}
                onClick={() => setActiveContent("reportes")}
              />

              {/* Menú Desplegable de Administrador */}
              <div className="pt-1">
                <button
                  onClick={() => setShowAdminOptions(!showAdminOptions)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-600 font-medium text-sm transition-all duration-150 group`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <PlusCircle size={20} />
                    </span>
                    {!isCollapsed && <span>Administrador</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight
                      size={16}
                      className={`transform transition-transform duration-200 text-slate-400 ${
                        showAdminOptions ? "rotate-90 text-indigo-600" : ""
                      }`}
                    />
                  )}
                </button>

                {showAdminOptions && !isCollapsed && (
                  <div className="ml-4 pl-3 mt-1 space-y-1 border-l-2 border-indigo-100">
                    <SidebarButton
                      icon={<ClipboardCheck size={18} />}
                      label="Evaluaciones"
                      collapsed={isCollapsed}
                      active={activeContent === "evaluaciones"}
                      onClick={() => setActiveContent("evaluaciones")}
                      small
                    />
                    <SidebarButton
                      icon={<Upload size={18} />}
                      label="Importar Excel"
                      collapsed={isCollapsed}
                      active={activeContent === "importexcel"}
                      onClick={() => setActiveContent("importexcel")}
                      small
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* SOLO ALUMNO */}
          {isAlumno && (
            <div className="pt-2">
              {!isCollapsed && (
                <p className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Académico
                </p>
              )}
              <SidebarButton
                icon={<ClipboardCheck size={20} />}
                label="Examen de Curso"
                collapsed={isCollapsed}
                active={activeContent === "evaluacionescursos"}
                onClick={() => setActiveContent("evaluacionescursos")}
              />
            </div>
          )}
        </nav>
      </div>

      {/* FOOTER / CONFIGURACIÓN */}
      {/* <div className="p-3 border-t border-slate-100">
        <SidebarButton
          icon={<Settings size={20} />}
          label="Configuración"
          collapsed={isCollapsed}
          active={activeContent === "settings"}
          onClick={() => setActiveContent("settings")}
        />
      </div> */}
    </aside>
  );
};

export default Sidebar;

/* --------------------------
   Componente Reutilizable Botón
---------------------------*/
interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  active?: boolean;
  small?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  collapsed,
  onClick,
  active = false,
  small = false,
}) => {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`relative flex items-center w-full rounded-xl transition-all duration-200 group ${
        small ? "py-2 px-3 text-xs" : "py-2.5 px-3 text-sm"
      } ${
        active
          ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      {/* Indicador activo izquierdo */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
      )}

      <span
        className={`flex items-center justify-center transition-colors ${
          active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
        } ${collapsed ? "mx-auto" : "mr-3"}`}
      >
        {icon}
      </span>

      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
};