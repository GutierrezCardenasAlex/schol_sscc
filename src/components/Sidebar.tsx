import React, { useEffect, useState } from "react";
import { getProfile, User } from "../services/auth";

interface SidebarProps {
  setActiveContent: (content: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveContent }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  useEffect(() => {
    getProfile().then(setUser).catch(console.error);
  }, []);

  if (!user) return <p className="p-4 text-gray-600">Cargando menú...</p>;

  const isAdmin = user.role === "admin";
  const isAlumno = user.role === "alumno";

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-white shadow-md transition-all duration-300 ease-in-out`}
    >
      {/* Botón de colapso */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 w-full text-gray-700 hover:bg-gray-200 focus:outline-none"
      >
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      <nav className="mt-6">
        {/* INICIO */}
        <SidebarButton
          icon="home"
          label="Inicio"
          collapsed={isCollapsed}
          onClick={() => setActiveContent("dashboard")}
        />

        {/* PERFIL */}
        <SidebarButton
          icon="user"
          label="Perfil"
          collapsed={isCollapsed}
          onClick={() => setActiveContent("profile")}
        />

        {/* SOLO ADMIN PUEDE VER ESTOS */}
        {isAdmin && (
          <>
            <SidebarButton
              icon="users"
              label="Alumnos"
              collapsed={isCollapsed}
              onClick={() => setActiveContent("alumnos")}
            />
            <SidebarButton
              icon="users"
              label="Docentes"
              collapsed={isCollapsed}
              onClick={() => setActiveContent("docentes")}
            />
            <SidebarButton
              icon="book"
              label="Materias"
              collapsed={isCollapsed}
              onClick={() => setActiveContent("materias")}
            />

            {/* ADMINISTRADOR */}
            <SidebarButton
              icon="plus"
              label="Administrador"
              collapsed={isCollapsed}
              onClick={() => setShowAdminOptions(!showAdminOptions)}
            />

            {showAdminOptions && (
              <div className="ml-6 border-l border-gray-300">
                <SidebarButton
                  icon="clipboard"
                  label="Evaluaciones"
                  collapsed={isCollapsed}
                  onClick={() => setActiveContent("evaluaciones")}
                  small
                />
                <SidebarButton
                  icon="clipboard-check"
                  label="Evaluaciones Cursos"
                  collapsed={isCollapsed}
                  onClick={() => setActiveContent("evaluacionescursos")}
                  small
                />
                <SidebarButton
                  icon="upload"
                  label="Importar Excel"
                  collapsed={isCollapsed}
                  onClick={() => setActiveContent("importexcel")}
                  small
                />
              </div>
            )}
          </>
        )}

        {/* SOLO ALUMNO PUEDE VER SU EXAMEN */}
        {isAlumno && (
          <SidebarButton
            icon="clipboard-check"
            label="Examen de Curso"
            collapsed={isCollapsed}
            onClick={() => setActiveContent("evaluacionescursos")}
          />
        )}

        {/* CONFIGURACIÓN */}
        <SidebarButton
          icon="settings"
          label="Configuración"
          collapsed={isCollapsed}
          onClick={() => setActiveContent("settings")}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;

/* --------------------------
   Componente Reutilizable
---------------------------*/
interface SidebarButtonProps {
  icon: string;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  small?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  collapsed,
  onClick,
  small = false,
}) => {
  const icons: Record<string, JSX.Element> = {
    home: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0L9 9"
      />
    ),
    user: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    users: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5V8H2v12h5m10-6a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
    book: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 20h9M12 4H3m9 0v16"
      />
    ),
    plus: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    ),
    clipboard: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 4h8v4H8V4zM4 8h16v12H4V8z"
      />
    ),
    "clipboard-check": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m-5-6h8v4H10V4zM4 8h16v12H4V8z"
      />
    ),
    upload: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v4h16v-4M12 12V4m0 0l-4 4m4-4l4 4"
      />
    ),
    settings: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </>
    ),
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center p-${small ? "3" : "4"} text-gray-700 hover:bg-gray-200 hover:text-indigo-600 w-full ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <svg
        className="h-5 w-5 mr-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {icons[icon]}
      </svg>
      {!collapsed && label}
    </button>
  );
};
