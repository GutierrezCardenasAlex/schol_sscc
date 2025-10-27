// DocentesTable.tsx

import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { X, Edit, Trash2, BookOpen, UserCheck, PlusCircle } from "lucide-react";
import EditDocenteModal from "./EditDocenteModal";
import CreateDocenteModal from "./CreateDocenteModal";
import AsignarMateriasModal from "./AsignarMateriasModal";

interface Docente {
  id: number;
  CI: string;
  name: string;
}

interface Materia {
  materia_id: number;
  materia: string;
  curso_id: number;
  grado: string;
  paralelo: string;
  paralelolet: string;
}

interface DocenteDetalles {
  CI: string;
  name: string;
  email: string;
  password: string;
}

// Componente principal
const DocentesTable: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);

  // Estados de modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [materiasModalOpen, setMateriasModalOpen] = useState(false);
  const [asignarModalOpen, setAsignarModalOpen] = useState(false);
  const [detallesModalOpen, setDetallesModalOpen] = useState(false);

  // Docente seleccionado
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [selectedDocenteId, setSelectedDocenteId] = useState<number | null>(null);
  const [selectedDocenteAsigId, setSelectedDocenteAsigId] = useState<number | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiasLoading, setMateriasLoading] = useState(false);
  const [docenteDetalles, setDocenteDetalles] = useState<DocenteDetalles | null>(null);
  const [detallesLoading, setDetallesLoading] = useState(false);

  // 🔹 Cargar docentes
  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await api.get<Docente[]>("/usuarios/view/docentes");
        setDocentes(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocentes();
  }, []);

  // 🔹 Filtrado y paginación
  const filteredDocentes = docentes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.CI.includes(search)
  );
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentDocentes = filteredDocentes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDocentes.length / perPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

  // 🔹 Modales y acciones
  const handleVerMaterias = async (docente: Docente) => {
    setMateriasLoading(true);
    setSelectedDocente(docente);
    setMateriasModalOpen(true);
    try {
      const res = await api.get(`/usuarios/view/docentemc/${docente.id}`);
      if (res.data.success) {
        setMaterias(res.data.data);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'No hay materias',
          text: `No se encontraron materias para ${docente.name}`,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las materias' });
    } finally {
      setMateriasLoading(false);
    }
  };

  const handleVerDocente = async (docente: Docente) => {
    setDetallesLoading(true);
    setSelectedDocente(docente);
    setDetallesModalOpen(true);
    try {
      const res = await api.get<DocenteDetalles>(`/usuarios/view/docente/${docente.id}`);
      setDocenteDetalles(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los datos del docente' });
    } finally {
      setDetallesLoading(false);
    }
  };

  const handleEditarBoton = (id: number) => {
    setSelectedDocenteId(id);
    setEditModalOpen(true);
  };

  const handleUpdateDocente = (updated: { CI: string; name: string; email: string }) => {
    setDocentes(prev => prev.map(d => (d.id === selectedDocenteId ? { ...d, ...updated } : d)));
  };

  const handleEliminarDocente = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al docente permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.get(`/usuarios/delete/docente/${id}`);
        setDocentes(prev => prev.filter(d => d.id !== id));
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Docente eliminado correctamente',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el docente.' });
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
    </div>
  );
  if (error) return <p className="text-red-500 font-medium">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Listado de Docentes</h2>

      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">

          <input
            type="text"
            placeholder="Buscar por nombre o CI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-full w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          />
        <button
          onClick={() => setCreateModalOpen(true) }
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1"
          title="Nuevo Docente"
        >
          <PlusCircle size={18} /> Nuevo
        </button>
      </div>

      {/* Tabla de docentes */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">CI</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDocentes.map((docente, index) => (
              <tr key={docente.id} className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}>
                <td className="px-6 py-4 whitespace-nowrap">{docente.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{docente.CI}</td>
                <td className="px-6 py-4 whitespace-nowrap">{docente.name}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2 flex-wrap">
  <button 
    onClick={() => handleEditarBoton(docente.id)} 
    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded" 
    title="Editar"
  >
    <Edit size={18} /> Editar
  </button>

  <button 
    onClick={() => handleEliminarDocente(docente.id)} 
    className="flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 rounded" 
    title="Eliminar"
  >
    <Trash2 size={18} /> Eliminar
  </button>

  <button 
    onClick={() => handleVerMaterias(docente)} 
    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded" 
    title="Ver Materias"
  >
    <BookOpen size={18} /> Ver Materias
  </button>

  <button 
    onClick={() => handleVerDocente(docente)} 
    className="flex items-center gap-1 text-green-600 hover:text-green-800 px-2 py-1 rounded" 
    title="Ver Docente"
  >
    <UserCheck size={18} /> Ver Docente
  </button>

  <button 
    onClick={() => { setSelectedDocenteAsigId(docente.id); setAsignarModalOpen(true); }} 
    className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 px-2 py-1 rounded" 
    title="Asignar Materias"
  >
    📚 Asignar Materias
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-4 gap-2">
        <button onClick={handlePrevPage} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-gray-800 text-white" : "bg-gray-200"}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        ))}
        <button onClick={handleNextPage} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">&gt;</button>
      </div>

      {/* Modales */}
      <CreateDocenteModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={(newDocente) => setDocentes(prev => [...prev,newDocente])} />
      {editModalOpen && <EditDocenteModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} docenteId={selectedDocenteId} onUpdate={handleUpdateDocente} />}
      {asignarModalOpen && selectedDocenteAsigId && <AsignarMateriasModal isOpen={asignarModalOpen} onClose={() => setAsignarModalOpen(false)} docenteAsigId={selectedDocenteAsigId} />}

      {/* Modal Materias */}
      {materiasModalOpen && selectedDocente && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl relative max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Materias de {selectedDocente.name}</h2>
              <button onClick={() => setMateriasModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {materiasLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : materias.length > 0 ? (
              <div className="overflow-auto max-h-[60vh] border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Materia</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Grado</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Curso ID</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Paralelo</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Letra</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materias.map((m) => (
                      <tr key={m.materia_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{m.materia}</td>
                        <td className="px-4 py-2">{m.grado}</td>
                        <td className="px-4 py-2">{m.curso_id}</td>
                        <td className="px-4 py-2">{m.paralelo}</td>
                        <td className="px-4 py-2">{m.paralelolet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">No hay materias asignadas a este docente</p>
            )}
          </div>
        </div>
      )}

      {/* Modal Detalles Docente */}
      {detallesModalOpen && docenteDetalles && selectedDocente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Datos de {selectedDocente.name}</h2>
              <button onClick={() => setDetallesModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            {detallesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>CI:</strong> {docenteDetalles.CI}</p>
                <p><strong>Nombre:</strong> {docenteDetalles.name}</p>
                <p><strong>Email:</strong> {docenteDetalles.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocentesTable;
