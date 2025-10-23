// src/pages/DashboardPage.tsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Widgets from "../components/Widgets";
import ProfileContent from "../components/ProfileContent";
import SettingsContent from "../components/SettingsContent";
import AlumnosContent from "../components/AlumnosContent";
import MateriaTable from "../components/MateriasContent";
import TestApi from "../components/TestApi";
import InteractiveSequentialImport from "../components/ImportExcel";
import DocentesTable from "../components/DocentesContent";
import EvaluacionesTable from "../components/EvaluacionesContent";
import EvaluacionesCurso from "../components/EvaluacionesCurso";
import { Outlet } from "react-router-dom";

const DashboardPage: React.FC = () => {
  // Estado para controlar el contenido mostrado
  const [activeContent, setActiveContent] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barra Lateral */}
      <Sidebar setActiveContent={setActiveContent} />

      {/* Contenido Principal */}
      <main className="flex-1 p-8 transition-all duration-300 ease-in-out">
        {/* Encabezado */}
        <Header />
        
        {/* Contenido Dinámico */}
        {activeContent === "dashboard" && <Widgets />}
        {activeContent === "profile" && <ProfileContent />}
        {activeContent === "settings" && <SettingsContent />}
        {activeContent === "alumnos" && <AlumnosContent />}
        {activeContent === "docentes" && <DocentesTable />}
        {activeContent === "materias" && <MateriaTable/>}
        {activeContent === "evaluaciones" && <EvaluacionesTable />}
        {activeContent === "importexcel" && <InteractiveSequentialImport />}
        {activeContent === "evaluacionescursos" && <EvaluacionesCurso />}
        
      </main>
      {/* <TestApi /> */}
      <Outlet />
    </div>
  );
};

export default DashboardPage;
