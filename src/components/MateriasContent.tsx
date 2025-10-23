import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Materia {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

const MateriaTable: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5); // filas por página

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await api.get<Materia[]>("/materia/viewall");
        setMaterias(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  // Filtrar materias por búsqueda
  const filteredMaterias = materias.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentMaterias = filteredMaterias.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMaterias.length / perPage);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error) return <p className="text-red-500 font-medium">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Listado de Materias</h2>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-xs"
      />

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Actualizado
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMaterias.map((materia, index) => (
              <tr
                key={materia.id}
                className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
              >
                <td className="px-6 py-4 whitespace-nowrap">{materia.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{materia.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{materia.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap">{materia.created_at}</td>
                <td className="px-6 py-4 whitespace-nowrap">{materia.updated_at}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-gray-800 text-white" : "bg-gray-200"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MateriaTable;
