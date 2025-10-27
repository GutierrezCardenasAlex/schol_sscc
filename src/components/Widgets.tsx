import React, { useEffect, useState } from "react";
import { getProfile, User } from "../services/auth";
import { BookOpen, Users, ClipboardCheck, Award } from "lucide-react";

interface WidgetsProps {
  minHeight?: string; // <-- nuevo prop opcional
}

const Widgets: React.FC<WidgetsProps> = ({ minHeight }) => {
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );

  return (
    <div
        style={{ minHeight: "80vh" }}
        className="bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center justify-center"
      >
      <div className="max-w-5xl w-full p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 text-center">
        {/* Encabezado con saludo */}
        <div className="mb-8">
          
          <h1 className="text-4xl font-extrabold text-gray-800">
            Sistema de Exámenes — Colegio SSCC
          </h1>
          <p className="text-gray-600 text-lg mt-3 max-w-3xl mx-auto">
  Bienvenido al sistema de evaluación en línea del{" "}
  <a
    href="https://www.sagradoscorazonesa.org"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-blue-600 hover:underline hover:text-blue-800 transition-colors"
  >
    Colegio Sagrados Corazones (SSCC)
  </a>.  
  Aquí podrás gestionar, rendir y calificar exámenes de manera rápida,
  organizada y segura.
</p>

        </div>

        {/* Sección de widgets informativos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-blue-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <BookOpen className="text-blue-600 w-10 h-10 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              Gestión de Materias
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Administra las asignaturas y exámenes de cada curso con facilidad.
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <Users className="text-purple-600 w-10 h-10 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              Usuarios y Roles
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Control total sobre profesores, alumnos y administradores.
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <ClipboardCheck className="text-green-600 w-10 h-10 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              Exámenes Online
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Evalúa conocimientos mediante pruebas seguras y automáticas.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <Award className="text-yellow-600 w-10 h-10 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              Resultados y Reportes
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Visualiza los resultados y analiza el rendimiento académico.
            </p>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Colegio SSCC — Sistema de Exámenes.  
            Desarrollado para optimizar la gestión académica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Widgets;
