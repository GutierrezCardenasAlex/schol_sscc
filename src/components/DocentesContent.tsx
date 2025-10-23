import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Toaster, toast } from "react-hot-toast";
import { X } from "lucide-react";
import EditDocenteModal from "./EditDocenteModal";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
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

const DocentesTable: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [modalMateriasOpen, setModalMateriasOpen] = useState(false);
  const [modalDocenteOpen, setModalDocenteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiasLoading, setMateriasLoading] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);

  const [docenteDetalles, setDocenteDetalles] = useState<DocenteDetalles | null>(null);
  const [detallesLoading, setDetallesLoading] = useState(false);

  const [selectedDocenteAsigId, setSelectedDocenteAsigId] = useState<number | null>(
    null
  );

  const AsignarMateriasModalHandler = (id: number) => {
    setSelectedDocenteAsigId(id);
    setModalOpen(true);
  };

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

  const filteredDocentes = docentes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.CI.includes(search)
  );

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentDocentes = filteredDocentes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDocentes.length / perPage);

  // Ver Materias
  const handleVerMaterias = async (docente: Docente) => {
    setMateriasLoading(true);
    setSelectedDocente(docente);
    setModalMateriasOpen(true);
    try {
      const res = await api.get(`/usuarios/view/docentemc/${docente.id}`);
      if (res.data.success) {
        setMaterias(res.data.data);
        toast.success(`📚 Materias de ${docente.name} cargadas`, {
          style: { background: "#4ade80", color: "white", fontWeight: "600" },
          icon: "✅",
        });
      } else {
        toast.error("❌ No se encontraron materias para este docente", {
          style: { background: "#f87171", color: "white", fontWeight: "600" },
          icon: "⚠️",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("🚨 Error al obtener las materias", {
        style: { background: "#ef4444", color: "white", fontWeight: "600" },
        icon: "⚠️",
      });
    } finally {
      setMateriasLoading(false);
    }
  };

  // Ver Datos del Docente
  const handleVerDocente = async (docente: Docente) => {
    setDetallesLoading(true);
    setSelectedDocente(docente);
    setModalDocenteOpen(true);
    try {
      const res = await api.get<DocenteDetalles>(`/usuarios/view/docente/${docente.id}`);
      setDocenteDetalles(res.data);
      toast.success(`👤 Datos de ${docente.name} cargados`, {
        style: { background: "#4ade80", color: "white", fontWeight: "600" },
        icon: "✅",
      });
    } catch (err: any) {
      console.error(err);
      toast.error("🚨 Error al obtener los datos del docente", {
        style: { background: "#ef4444", color: "white", fontWeight: "600" },
        icon: "⚠️",
      });
    } finally {
      setDetallesLoading(false);
    }
  };




    const handleEliminarDocente = async (id: number) => {
  // Mostrar la alerta de confirmación
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

      // Mostrar un toast de éxito
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el docente.',
      });
    }
  }
};


  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDocenteId, setSelectedDocenteId] = useState<number | null>(null);

  const handleEditarBoton = (id: number) => {
    setSelectedDocenteId(id);
    setEditModalOpen(true);
  };

  const handleUpdateDocente = (updated: { CI: string; name: string; email: string }) => {
    setDocentes(prev =>
      prev.map(d => (d.id === selectedDocenteId ? { ...d, ...updated } : d))
    );
  };



  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error) return <p className="text-red-500 font-medium">Error: {error}</p>;

  return (
    <div className="p-4">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Listado de Docentes</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o CI..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-xs"
      />
      <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          ➕ Nuevo Docente
        </button>

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
              <tr
                key={docente.id}
                className={
                  index % 2 === 0
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "bg-white hover:bg-gray-100"
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">{docente.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{docente.CI}</td>
                <td className="px-6 py-4 whitespace-nowrap">{docente.name}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    onClick={() => handleEditarBoton(docente.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                    Editar
                </button>
                <EditDocenteModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    docenteId={selectedDocenteId}
                    onUpdate={handleUpdateDocente}
                    />

                  <button
                    onClick={() => handleEliminarDocente(docente.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleVerMaterias(docente)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    {materiasLoading && selectedDocente?.id === docente.id
                      ? "Cargando..."
                      : "Ver Materia"}
                  </button>
                  <button
                    onClick={() => handleVerDocente(docente)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    {detallesLoading && selectedDocente?.id === docente.id
                      ? "Cargando..."
                      : "Ver Docente"}
                  </button>
                  <button
            onClick={() => AsignarMateriasModalHandler(docente.id)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Asignar Materias
          </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
      {/* Modal Crear Docente */}
            <CreateDocenteModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
            />
      {modalOpen && selectedDocenteAsigId && (
        <AsignarMateriasModal
          docenteAsigId={selectedDocenteAsigId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
      {/* Modal Materias */}
      {modalMateriasOpen && selectedDocente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Materias de {selectedDocente.name}
              </h2>
              <button
                onClick={() => setModalMateriasOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {materiasLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : materias.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Materia</th>
                    <th className="border p-2">Grado</th>
                    <th className="border p-2">Paralelo</th>
                    <th className="border p-2">Letra</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m) => (
                    <tr key={m.curso_id} className="text-center">
                      <td className="border p-2">{m.materia}</td>
                      <td className="border p-2">{m.grado}</td>
                      <td className="border p-2">{m.paralelo}</td>
                      <td className="border p-2">{m.paralelolet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No hay materias asignadas a este docente
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal Detalles Docente */}
      {modalDocenteOpen && docenteDetalles && selectedDocente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Datos de {selectedDocente.name}
              </h2>
              <button
                onClick={() => setModalDocenteOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {detallesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>CI:</strong> {docenteDetalles.CI}
                </p>
                <p>
                  <strong>Nombre:</strong> {docenteDetalles.name}
                </p>
                <p>
                  <strong>Email:</strong> {docenteDetalles.email}
                </p>
                <p>
                  <strong>Password:</strong> {docenteDetalles.password}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocentesTable;
