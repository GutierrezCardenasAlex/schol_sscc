import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import SubirEvaluacionModal from "./AsignarEvaluacionModal";
import {
  Clock,
  Save,
  UploadCloud,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Info,
  BarChart3,
} from "lucide-react";

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
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<{ [key: number]: string }>({});

  const fetchEvaluaciones = async () => {
    try {
      if (!loading) setUpdating(true);
      const res = await api.get<Evaluacion[]>("/evaluacion/todo");
      setEvaluaciones(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const handleToggleEstado = async (eva: Evaluacion) => {
    try {
      const url = eva.estado
        ? `/evaluacion/inactive/${eva.id}`
        : `/evaluacion/active/${eva.id}`;
      await api.get(url);
      setEvaluaciones((prev) =>
        prev.map((e) => (e.id === eva.id ? { ...e, estado: !e.estado } : e))
      );
      Swal.fire({
        icon: "success",
        title: `Evaluación ${eva.estado ? "inactivada" : "activada"} correctamente`,
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const handleChangeTime = (id: number, value: string) => {
    setEditingTime((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateTime = async (id: number) => {
    const newTime = editingTime[id];
    if (!newTime || isNaN(Number(newTime))) {
      Swal.fire("Error", "Ingresa un número válido de minutos", "error");
      return;
    }
    try {
      await api.post(`/evaluacion/editime/${id}`, {
        duracion_minutos: newTime,
      });
      setEvaluaciones((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, duracion_minutos: Number(newTime) } : e
        )
      );
      Swal.fire({
        icon: "success",
        title: "Duración actualizada correctamente",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "No se pudo actualizar la duración", "error");
    }
  };

  // Acciones (simuladas)
  const handleVerDetalles = (eva: Evaluacion) => {
    Swal.fire({
      title: "Detalles de la Evaluación",
      html: `
        <b>Título:</b> ${eva.titulo}<br/>
        <b>Curso:</b> ${eva.curso_nombre}<br/>
        <b>Materia:</b> ${eva.materia_nombre}<br/>
        <b>Docente:</b> ${eva.docente_nombre}<br/>
        <b>Duración:</b> ${eva.duracion_minutos} minutos<br/>
        <b>Estado:</b> ${eva.estado ? "Activo" : "Inactivo"}
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#2563eb",
    });
  };

  const handleVerReportes = (eva: Evaluacion) => {
    Swal.fire({
      title: "Reportes por Curso",
      text: `Mostrando reportes del curso "${eva.curso_nombre}"...`,
      icon: "bar-chart",
      confirmButtonText: "Cerrar",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );

  if (error)
    return (
      <p className="text-red-500 font-medium text-center mt-4">
        Error: {error}
      </p>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="text-green-600" /> Evaluaciones
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold transition"
        >
          <UploadCloud size={20} />
          Subir Evaluación
        </button>
      </div>

      {modalOpen && (
        <SubirEvaluacionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onUploaded={fetchEvaluaciones}
        />
      )}

      {updating && (
        <div className="flex items-center gap-2 text-green-700 font-semibold mb-3 animate-pulse">
          <RefreshCcw className="animate-spin" size={18} />
          Actualizando evaluaciones...
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full bg-white rounded-2xl overflow-hidden">
          <thead className="bg-green-600 text-white uppercase text-sm">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Título</th>
              <th className="px-6 py-3 text-left">Curso</th>
              <th className="px-6 py-3 text-left">Materia</th>
              <th className="px-6 py-3 text-left">Docente</th>
              <th className="px-6 py-3 text-center">Duración</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.map((eva) => (
              <tr
                key={eva.id}
                className="hover:bg-gray-50 border-b transition"
              >
                <td className="px-6 py-3 font-semibold text-gray-700">
                  #{eva.id}
                </td>
                <td className="px-6 py-3">{eva.titulo}</td>
                <td className="px-6 py-3">{eva.curso_nombre}</td>
                <td className="px-6 py-3">{eva.materia_nombre}</td>
                <td className="px-6 py-3">{eva.docente_nombre}</td>

                {/* Duración con input editable */}
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={editingTime[eva.id] ?? eva.duracion_minutos}
                      onChange={(e) =>
                        handleChangeTime(eva.id, e.target.value)
                      }
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <button
                      onClick={() => handleUpdateTime(eva.id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => handleToggleEstado(eva)}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-full font-semibold transition ${
                      eva.estado
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {eva.estado ? (
                      <>
                        <CheckCircle2 size={16} /> Activo
                      </>
                    ) : (
                      <>
                        <XCircle size={16} /> Inactivo
                      </>
                    )}
                  </button>
                </td>

                {/* Acciones nuevas */}
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleVerDetalles(eva)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                    >
                      <Info size={16} /> Detalles
                    </button>
                    <button
                      onClick={() => handleVerReportes(eva)}
                      className="flex items-center gap-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition"
                    >
                      <BarChart3 size={16} /> Reportes
                    </button>
                  </div>
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
