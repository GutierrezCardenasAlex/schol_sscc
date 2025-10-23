import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Swal from "sweetalert2";

interface Evaluacion {
  id: number;
  titulo: string;
  estado: boolean;
  curso_nombre: string;
  materia_nombre: string;
  docente_nombre: string;
  duracion_minutos: number;
}

interface CronometroResponse {
  inicio: string;
  fin: string;
  tiempo_restante_segundos: number;
  tiempo_restante_formato: string;
  estado: string;
  finalizado: boolean;
}

const EvaluacionesCurso: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disabledExams, setDisabledExams] = useState<number[]>([]);
  const alumno_id = 24;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        const res = await api.get<Evaluacion[]>("/evaluacion/curso/17");
        const data = res.data;

        // 🔹 Verificamos el estado de cada examen con /examen/cronometro
        const checkExamStatus = async (examen_id: number) => {
          try {
            const cronometro = await api.post<CronometroResponse>("/examen/cronometro", {
              alumno_id,
              examen_id,
            });
            // Si está finalizado, se agrega a la lista de desactivados
            if (cronometro.data.finalizado) {
              setDisabledExams((prev) => [...prev, examen_id]);
            }
          } catch {
            // Si falla la consulta, no lo desactiva
          }
        };

        // 🔹 Ejecutamos la verificación de cada examen
        await Promise.all(data.map((eva) => checkExamStatus(eva.id)));

        setEvaluaciones(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al obtener las evaluaciones");
        Swal.fire("Error", "No se pudieron cargar las evaluaciones", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluaciones();
  }, []);

  const handleEmpezar = async (examen_id: number) => {
    const result = await Swal.fire({
      title: "¿Deseas comenzar el examen?",
      text: "Al iniciar el examen, comenzará el tiempo de evaluación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, comenzar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.post("/examen/empezar", { alumno_id, examen_id });
        Swal.fire("Éxito", "Examen iniciado correctamente", "success");
        navigate("/examen-view", { state: { alumno_id, examen_id } });
      } catch (err: any) {
        console.error(err);
        Swal.fire("Error", "No se pudo iniciar el examen. Puede que ya haya finalizado.", "error");
        setDisabledExams((prev) => [...prev, examen_id]);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error)
    return <p className="text-red-500 font-medium text-center mt-6">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        📘 Evaluaciones del Curso
      </h2>

      {evaluaciones.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Curso</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Materia</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Docente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-center">Duración (min)</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluaciones.map((eva) => {
                const isDisabled = disabledExams.includes(eva.id);
                return (
                  <tr key={eva.id} className="hover:bg-gray-100 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{eva.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{eva.titulo}</td>
                    <td className="px-6 py-4 text-gray-700">{eva.curso_nombre}</td>
                    <td className="px-6 py-4 text-gray-700">{eva.materia_nombre}</td>
                    <td className="px-6 py-4 text-gray-700">{eva.docente_nombre}</td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {eva.duracion_minutos}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEmpezar(eva.id)}
                        disabled={isDisabled}
                        className={`px-4 py-2 rounded-lg shadow-md transition ${
                          isDisabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {isDisabled ? "Finalizado" : "Empezar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-md">
          <p className="text-gray-600 text-lg font-medium">
            📝 No hay exámenes disponibles por el momento.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Vuelve más tarde o consulta con tu docente.
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluacionesCurso;
