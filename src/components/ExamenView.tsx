import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import ExamenCronometro from "./ExamenCronometro ";

interface Opcion { id: number; texto: string; }
interface Pregunta { id: number; enunciado: string; opciones: Opcion[]; }
interface Examen { id: number; titulo: string; preguntas: Pregunta[]; }
interface Resultado { mensaje: string; respuestas_correctas: number; total_preguntas: number; puntaje: number; }

const ExamenView: React.FC = () => {
  const location = useLocation();
  const { alumno_id, examen_id } = location.state as { alumno_id: number; examen_id: number };

  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: number]: number }>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [finalizado, setFinalizado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [tiempoFormato, setTiempoFormato] = useState("");

  // 🔹 Obtener examen
  useEffect(() => {
  const fetchExamen = async () => {
    try {
      // Obtener examen
      const resExamen = await api.get(`/evaluacion/${examen_id}`);
      setExamen(resExamen.data.examen);

      // Obtener cronómetro desde backend
      const resCrono = await api.post(`/examen/cronometro`, {
        examen_id,
        alumno_id
      });

      // Guardar datos del cronómetro
      setTiempoRestante(resCrono.data.tiempo_restante_segundos);
      setTiempoFormato(resCrono.data.tiempo_restante_formato); // 👈 Aquí lo guardas

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchExamen();
}, [alumno_id, examen_id]);


  const handleSelectOpcion = (preguntaId: number, opcionId: number) => {
    if (finalizado) return;
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionId }));
  };

  const handleNext = () => setCurrentIndex(idx => Math.min(idx + 1, examen!.preguntas.length - 1));
  const handlePrev = () => setCurrentIndex(idx => Math.max(idx - 1, 0));

  const handleFinalizar = async (auto = false) => {
    if (!examen || finalizado) return;

    if (!auto) {
      const result = await Swal.fire({
        title: "Finalizar examen",
        text: "¿Deseas guardar tus respuestas y finalizar el examen?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
      });
      if (!result.isConfirmed) return;
    }

    const respuestasArray = examen.preguntas.map(p => ({
      pregunta_id: p.id,
      opcion_id: respuestas[p.id] || 0,
    }));

    try {
      const res = await api.post("/respuestas/subir", { alumno_id, examen_id, respuestas: respuestasArray });

      setResultado({
        mensaje: res.data.mensaje,
        respuestas_correctas: res.data.respuestas_correctas,
        total_preguntas: res.data.total_preguntas,
        puntaje: res.data.puntaje,
      });
      setFinalizado(true);

      Swal.fire(
        "Examen finalizado",
        auto ? "El tiempo ha terminado. Tus respuestas fueron guardadas." : "Tus respuestas han sido guardadas.",
        "success"
      );
    } catch (err) {
      Swal.fire("Error", "No se pudo finalizar el examen", "error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-gray-800 rounded-full"></div>
      </div>
    );

  if (!examen) return <p className="text-red-500 text-center mt-10">No se pudo cargar el examen.</p>;

  const preguntaActual = examen.preguntas[currentIndex];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center text-indigo-700">{examen.titulo}</h1>
      <ExamenCronometro examen_id={examen_id} alumno_id={alumno_id} />
      <p className="mb-2 text-gray-700">Alumno ID: {alumno_id}</p>
      <p className="mb-4 text-gray-700">Examen ID: {examen_id}</p>
      <p></p>

      {!finalizado && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
            <h2 className="text-xl font-semibold mb-4">
              {currentIndex + 1}. {preguntaActual.enunciado}
            </h2>
            {preguntaActual.opciones.map(op => (
              <label key={op.id} className="block mb-3 cursor-pointer">
                <input
                  type="radio"
                  name={`pregunta-${preguntaActual.id}`}
                  value={op.id}
                  checked={respuestas[preguntaActual.id] === op.id}
                  onChange={() => handleSelectOpcion(preguntaActual.id, op.id)}
                  className="mr-3 accent-indigo-600"
                />
                {op.texto}
              </label>
            ))}
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded disabled:opacity-50 transition"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === examen.preguntas.length - 1}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded transition"
            >
              Siguiente
            </button>
          </div>

          <button
            onClick={() => handleFinalizar(false)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mb-4 transition"
          >
            Finalizar Examen
          </button>

          <p className="text-sm text-gray-500 text-center">
            Pregunta {currentIndex + 1} de {examen.preguntas.length}
          </p>
        </>
      )}

      {finalizado && resultado && (
        <div className="mt-6 bg-green-100 p-6 rounded-lg shadow text-center">
          <h3 className="font-semibold text-green-700 mb-2">{resultado.mensaje}</h3>
          <p className="mb-1">
            Respuestas correctas: {resultado.respuestas_correctas} / {resultado.total_preguntas}
          </p>
          <p>Puntaje: {resultado.puntaje}%</p>
        </div>
      )}
    </div>
  );
};

export default ExamenView;
