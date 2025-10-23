import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import SubirEvaluacionModal from "./AsignarEvaluacionModal";

interface Evaluacion {
  id: number;
  titulo: string;
  estado: boolean;
  curso_nombre: string;
  materia_nombre: string;
  docente_nombre: string;
  duracion_minutos: number;
}

const EvaluacionesTable: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<{[key:number]: string}>({});

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        const res = await api.get<Evaluacion[]>("/evaluacion/todo");
        setEvaluaciones(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluaciones();
  }, []);

  const handleToggleEstado = async (eva: Evaluacion) => {
    try {
      const url = eva.estado
        ? `/evaluacion/inactive/${eva.id}`
        : `/evaluacion/active/${eva.id}`;
      await api.get(url);
      setEvaluaciones(prev =>
        prev.map(e =>
          e.id === eva.id ? { ...e, estado: !e.estado } : e
        )
      );
      Swal.fire({
        icon: "success",
        title: `Evaluación ${eva.estado ? "inactivada" : "activada"} correctamente`,
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const handleChangeTime = (id: number, value: string) => {
    setEditingTime(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateTime = async (id: number) => {
    const newTime = editingTime[id];
    if (!newTime || isNaN(Number(newTime))) {
      Swal.fire("Error", "Ingresa un número válido de minutos", "error");
      return;
    }
    try {
      await api.post(`/evaluacion/editime/${id}`, { duracion_minutos: newTime });
      setEvaluaciones(prev =>
        prev.map(e => (e.id === id ? { ...e, duracion_minutos: Number(newTime) } : e))
      );
      Swal.fire({
        icon: "success",
        title: "Duración actualizada correctamente",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire("Error", "No se pudo actualizar la duración", "error");
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
      <h2 className="text-2xl font-bold mb-4">Listado de Evaluaciones</h2>
      
<button onClick={() => setModalOpen(true)} className="bg-yellow-500 px-4 py-2 rounded-lg">
  Subir Evaluación
</button>
{modalOpen && <SubirEvaluacionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}

      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Curso</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Materia</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Docente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Duración</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluaciones.map((eva) => (
              <tr key={eva.id} className="hover:bg-gray-100">
                <td className="px-6 py-4">{eva.id}</td>
                <td className="px-6 py-4">{eva.titulo}</td>
                <td className="px-6 py-4">{eva.curso_nombre}</td>
                <td className="px-6 py-4">{eva.materia_nombre}</td>
                <td className="px-6 py-4">{eva.docente_nombre}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <input
                    type="number"
                    className="border rounded px-2 w-20"
                    value={editingTime[eva.id] ?? eva.duracion_minutos}
                    onChange={(e) => handleChangeTime(eva.id, e.target.value)}
                  />
                  <button
                    onClick={() => handleUpdateTime(eva.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Guardar
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleEstado(eva)}
                    className={`w-full py-2 font-bold text-white rounded-lg ${
                      eva.estado ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {eva.estado ? "Activo" : "Inactivo"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluacionesTable;
