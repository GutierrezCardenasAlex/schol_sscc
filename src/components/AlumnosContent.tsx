import React, { useEffect, useState } from "react";
import api from "../services/api";
import CreateAlumnoModal from "./CreateAlumnoModal";
import EditAlumnosModal from "./EditAlumnoModal";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface Alumno {
  id: number;
  CI: string;
  name: string;
  grado?: string;
  paralelo?: string;
  estado?: string;
}

interface Curso {
  id: number;
  curso: string;
}

const AlumnoTable: React.FC = () => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);

  // 🔹 Cargar cursos al inicio
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await api.get<Curso[]>("/curso/viewall");
        setCursos(response.data);
      } catch (err: any) {
        console.error("Error cargando cursos:", err);
      }
    };
    fetchCursos();
  }, []);

  // 🔹 Cargar alumnos (todos o por curso)
  useEffect(() => {
    const fetchAlumnos = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedCurso) {
          response = await api.get<Alumno[]>(`/usuarios/view/alumnos/${selectedCurso}`);
        } else {
          response = await api.get<Alumno[]>("/usuarios/view/alumnosactive");
        }
        setAlumnos(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumnos();
  }, [selectedCurso]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(null);

  const handleEditarBoton = (id: number) => {
    setSelectedAlumnoId(id);
    setEditModalOpen(true);
  };

  const handleUpdateAlumno = (updated: { CI: string; name: string; email: string }) => {
    setAlumnos(prev =>
      prev.map(d => (d.id === selectedAlumnoId ? { ...d, ...updated } : d))
    );
  };

  const handleEliminarAlumno = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al alumno permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.get(`/usuarios/delete/alumno/${id}`);
        setAlumnos(prev => prev.filter(a => a.id !== id));

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Alumno eliminado correctamente',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el alumno.',
        });
      }
    }
  };

  // 🔹 Filtrar alumnos por nombre o CI
  const filteredAlumnos = alumnos.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.CI.includes(search)
  );

  // 🔹 Paginación (cálculos base)
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentAlumnos = filteredAlumnos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAlumnos.length / perPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // 🔹 Mostrar máximo 5 páginas
  const getPageNumbers = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  // 🔹 Render principal
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error) return <p className="text-red-500 font-medium">Error: {error}</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Listado de Alumnos</h2>

      {/* 🔹 Barra superior */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          ➕ Nuevo Alumno
        </button>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o CI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-52"
          />

          <select
            value={selectedCurso === "" ? "" : Number(selectedCurso)}
            onChange={(e) =>
              setSelectedCurso(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="p-2 border rounded w-48"
          >
            <option value="">Todos los cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.curso}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 Modal Crear Alumno */}
      <CreateAlumnoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* 🔹 Tabla */}
      <div className="overflow-x-auto border rounded-lg shadow max-w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">CI</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Grado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Paralelo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentAlumnos.map((alumno, index) => (
              <tr
                key={alumno.id}
                className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
              >
                <td className="px-6 py-4 whitespace-nowrap">{alumno.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.CI}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.grado}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.paralelo}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    onClick={() => handleEditarBoton(alumno.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <EditAlumnosModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    alumnoId={selectedAlumnoId}
                    onUpdate={handleUpdateAlumno}
                  />
                  <button
                    onClick={() => handleEliminarAlumno(alumno.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Paginación */}
      <div className="flex justify-center mt-6 items-center gap-2 flex-wrap">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          ⬅️ Anterior
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentPage(Number(page))}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  );
};

export default AlumnoTable;
