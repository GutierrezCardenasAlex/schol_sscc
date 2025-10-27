import React, { useEffect, useState } from "react";
import { getProfile, User } from "../services/auth";

const ProfileContent = () => {
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">No se pudo cargar el perfil.</p>
      </div>
    );

  const isAdmin = user.role?.toLowerCase() === "admin";

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">
            Perfil del Usuario
          </h2>
          <p className="text-gray-500 text-sm">{user.role}</p>
        </div>

        {/* Contenido en dos columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div>
              <strong className="block text-gray-600 text-sm uppercase">
                Nombre:
              </strong>
              <p className="text-lg font-medium">{user.name}</p>
            </div>

            <div>
              <strong className="block text-gray-600 text-sm uppercase">
                Email:
              </strong>
              <p className="text-lg font-medium">{user.email || "N/A"}</p>
            </div>

            <div>
              <strong className="block text-gray-600 text-sm uppercase">CI:</strong>
              <p className="text-lg font-medium">{user.CI}</p>
            </div>
          </div>

          {/* Columna Derecha */}
          {!isAdmin ? (
            <div className="space-y-4">
              <div>
                <strong className="block text-gray-600 text-sm uppercase">
                  Curso:
                </strong>
                <p className="text-lg font-medium">{user.curso_id || "N/A"}</p>
              </div>

              <div>
                <strong className="block text-gray-600 text-sm uppercase">
                  Grado:
                </strong>
                <p className="text-lg font-medium">{user.grado || "N/A"}</p>
              </div>

              <div>
                <strong className="block text-gray-600 text-sm uppercase">
                  Paralelo:
                </strong>
                <p className="text-lg font-medium">{user.paralelo || "N/A"}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <p className="italic">Administrador sin datos académicos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
