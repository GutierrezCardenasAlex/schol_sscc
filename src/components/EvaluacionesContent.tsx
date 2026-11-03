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
  FileText,
} from "lucide-react";

interface Evaluacion {
  id: number;
  titulo: string;
  estado: boolean;
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

  const handleVerDetalles = (eva: Evaluacion) => {
    Swal.fire({
      title: "Detalles de la Evaluación",
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <b>Título:</b> ${eva.titulo}<br/>
          <b>Materia:</b> ${eva.materia_nombre}<br/>
          <b>Docente:</b> ${eva.docente_nombre}<br/>
          <b>Duración:</b> ${eva.duracion_minutos} minutos<br/>
          <b>Estado:</b> ${eva.estado ? "Activo" : "Inactivo"}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#4f46e5",
    });
  };

  const handleVerReportes = (eva: Evaluacion) => {
    Swal.fire({
      title: "Reportes de la Evaluación",
      text: `Mostrando reportes de "${eva.titulo}"...`,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#4f46e5",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <p className="text-rose-500 font-medium text-center mt-4">
        Error: {error}
      </p>
    );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock size={24} />
            </div>
            Gestión de Evaluaciones
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Administra los tiempos, estados y reportes de las evaluaciones disponibles.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-100 transition-all"
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
        <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4 text-sm bg-indigo-50 p-3 rounded-xl animate-pulse">
          <RefreshCcw className="animate-spin" size={18} />
          Actualizando evaluaciones...
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full bg-white divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-3.5">ID</th>
              <th className="px-6 py-3.5">Título</th>
              <th className="px-6 py-3.5">Materia</th>
              <th className="px-6 py-3.5">Docente</th>
              <th className="px-6 py-3.5 text-center">Duración (min)</th>
              <th className="px-6 py-3.5 text-center">Estado</th>
              <th className="px-6 py-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {evaluaciones.map((eva) => (
              <tr key={eva.id} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-4 font-bold text-slate-500">
                  #{eva.id}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-500 shrink-0" />
                  <span className="truncate max-w-xs">{eva.titulo}</span>
                </td>
                <td className="px-6 py-4">{eva.materia_nombre}</td>
                <td className="px-6 py-4">{eva.docente_nombre}</td>

                {/* Duración con input editable */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={editingTime[eva.id] ?? eva.duracion_minutos}
                      onChange={(e) =>
                        handleChangeTime(eva.id, e.target.value)
                      }
                      className="w-20 border border-slate-300 rounded-lg px-2.5 py-1.5 text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-800 font-medium transition-all"
                    />
                    <button
                      onClick={() => handleUpdateTime(eva.id)}
                      title="Guardar duración"
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg text-white transition-all shadow-sm"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleEstado(eva)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      eva.estado
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {eva.estado ? (
                      <>
                        <CheckCircle2 size={14} /> Activo
                      </>
                    ) : (
                      <>
                        <XCircle size={14} /> Inactivo
                      </>
                    )}
                  </button>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleVerDetalles(eva)}
                      title="Ver detalles"
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
                    >
                      <Info size={14} /> Detalles
                    </button>
                    <button
                      onClick={() => handleVerReportes(eva)}
                      title="Ver reportes"
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg text-xs transition"
                    >
                      <BarChart3 size={14} /> Reportes
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