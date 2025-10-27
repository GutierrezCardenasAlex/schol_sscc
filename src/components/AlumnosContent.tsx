import React, { useEffect, useState } from "react";
import api from "../services/api";
import CreateAlumnoModal from "./CreateAlumnoModal";
import EditAlumnosModal from "./EditAlumnoModal";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Edit, Trash2 } from "lucide-react";

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
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(null);

  // 🔹 Cargar cursos
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

  // 🔹 Cargar alumnos
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

  // 🔹 Cargar alumnos al inicio y cuando cambia el curso
  useEffect(() => {
    fetchAlumnos();
    setCurrentPage(1); // Reiniciar paginación al cambiar curso
  }, [selectedCurso]);

  // 🔹 Reiniciar paginación cuando se escribe en la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 🔹 Abrir modal de edición
  const handleEditarBoton = (id: number) => {
    setSelectedAlumnoId(id);
    setEditModalOpen(true);
  };

  // 🔹 Actualizar alumno después de editar
  const handleUpdateAlumno = (updated: { CI: string; name: string; email: string; password?: string }) => {
    if (!selectedAlumnoId) return;

    setAlumnos((prev) =>
      prev.map((a) => (a.id === selectedAlumnoId ? { ...a, ...updated } : a))
    );

    setHighlightedId(selectedAlumnoId);
    setTimeout(() => setHighlightedId(null), 2000);

    Swal.fire({
      icon: "success",
      title: "Usuario editado satisfactoriamente",
      showConfirmButton: false,
      timer: 2000,
    });

    setEditModalOpen(false);
    setSelectedAlumnoId(null);
  };

  // 🔹 Eliminar alumno
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

  // 🔹 Filtrar alumnos
  const filteredAlumnos = alumnos.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.CI.includes(search)
  );

  // 🔹 Paginación
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentAlumnos = filteredAlumnos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAlumnos.length / perPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage((prev) => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage((prev) => prev - 1); };

  // ✅ Nueva paginación limpia (sin bugs)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

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

      {/* Barra superior */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <button onClick={() => setModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          ➕ Nuevo Alumno
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar alumno por nombre o CI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-full w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          />
          <select
            value={selectedCurso === "" ? "" : Number(selectedCurso)}
            onChange={(e) => setSelectedCurso(e.target.value === "" ? "" : Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-48"
          >
            <option value="">📚 Todos los cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>{curso.curso}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal Crear Alumno */}
      <CreateAlumnoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchAlumnos}/>

      {/* Modal Editar Alumno */}
      {editModalOpen && selectedAlumnoId && (
        <EditAlumnosModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          alumnoId={selectedAlumnoId}
          onUpdate={handleUpdateAlumno}
        />
      )}

      {/* Tabla */}
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
                className={`${alumno.id === highlightedId ? "bg-green-100 animate-pulse" : index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
              >
                <td className="px-6 py-4 whitespace-nowrap">{alumno.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.CI}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.grado}</td>
                <td className="px-6 py-4 whitespace-nowrap">{alumno.paralelo}</td>

                <td className="px-6 py-4 whitespace-nowrap flex gap-2 flex-wrap">
                  <button 
                    onClick={() => handleEditarBoton(alumno.id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded" 
                    title="Editar"
                  >
                    <Edit size={18} /> Editar
                  </button>
                
                  <button 
                    onClick={() => handleEliminarAlumno(alumno.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 rounded" 
                    title="Eliminar"
                  >
                    <Trash2 size={18} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-6 items-center gap-2 flex-wrap">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1} 
          className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-800 text-white hover:bg-gray-700"}`}
        >
          ⬅️ Anterior
        </button>

        {getPageNumbers().map((page, index) =>
          <button 
            key={index} 
            onClick={() => setCurrentPage(Number(page))} 
            className={`px-3 py-1 rounded ${currentPage === page ? "bg-gray-800 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {page}
          </button>
        )}

        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages} 
          className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-800 text-white hover:bg-gray-700"}`}
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  );
};

export default AlumnoTable;
