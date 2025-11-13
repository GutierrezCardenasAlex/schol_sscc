import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";

interface Opcion {
  id: number;
  texto: string;
}

interface Pregunta {
  id: number;
  enunciado: string | null;
  imagen: string | null;
  opciones: Opcion[];
}

interface Examen {
  id: number;
  titulo: string;
  preguntas: Pregunta[];
}

interface Resultado {
  mensaje: string;
  respuestas_correctas: number;
  total_preguntas: number;
  puntaje: number;
}

const ExamenView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const data =
    location.state || JSON.parse(localStorage.getItem("ultimo_examen") || "{}");
  const { alumno_id, examen_id, duracion_minutos } = data as { alumno_id: number; examen_id: number; duracion_minutos: number };

  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: number]: number }>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [finalizado, setFinalizado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number>(duracion_minutos * 60);

  const tiempoStorageKey = `examen_${examen_id}_tiempo`;

  // Inicializar tiempo restante desde localStorage si existe
  useEffect(() => {
    const savedTime = localStorage.getItem(tiempoStorageKey);
    if (savedTime) {
      const tiempo = Number(savedTime);
      if (!isNaN(tiempo) && tiempo > 0) {
        setTiempoRestante(tiempo);
      }
    }
  }, [tiempoStorageKey]);

  // Guardar el tiempo restante y manejar finalización automática
  useEffect(() => {
    if (finalizado) return;

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalizar(true); // Finalización automática
          return 0;
        }
        localStorage.setItem(tiempoStorageKey, String(prev - 1));
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finalizado, tiempoStorageKey]);

  useEffect(() => {
    if (!alumno_id || !examen_id) {
      Swal.fire("Error", "No se encontró la información del examen", "error").then(() => {
        navigate("/dashboard");
      });
      return;
    }
    localStorage.setItem("ultimo_examen", JSON.stringify({ alumno_id, examen_id, duracion_minutos }));
  }, [alumno_id, examen_id, duracion_minutos, navigate]);

  useEffect(() => {
    const fetchExamen = async () => {
      Swal.fire({
        title: "Cargando examen...",
        text: "Por favor, espera un momento",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const resExamen = await api.get(`/evaluacion/${examen_id}`);
        setExamen(resExamen.data.examen);
        Swal.close();
      } catch (err) {
        console.error(err);
        Swal.fire(
          "Error",
          "No se pudo cargar el examen o no hay conexión con el servidor.",
          "error"
        ).then(() => {
          navigate("/dashboard");
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExamen();
  }, [alumno_id, examen_id, navigate]);

  const handleSelectOpcion = (preguntaId: number, opcionId: number) => {
    if (finalizado) return;
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
  };

  const handleNext = () =>
    setCurrentIndex((idx) => Math.min(idx + 1, examen!.preguntas.length - 1));
  const handlePrev = () => setCurrentIndex((idx) => Math.max(idx - 0, 0));

  const handleFinalizar = async (auto = false) => {
    if (!examen || finalizado) return;

    if (!auto) {
      const result = await Swal.fire({
        title: "¿Finalizar examen?",
        text: "Se guardarán tus respuestas actuales.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, finalizar",
        cancelButtonText: "Cancelar",
      });
      if (!result.isConfirmed) return;
    }

    const respuestasArray = examen.preguntas.map((p) => ({
      pregunta_id: p.id,
      opcion_id: respuestas[p.id] !== undefined ? respuestas[p.id] : -1,
    }));

    try {
      const res = await api.post("/respuestas/subir", {
        alumno_id,
        examen_id,
        respuestas: respuestasArray,
      });

      setResultado(res.data);
      setFinalizado(true);
      localStorage.removeItem(tiempoStorageKey);

      Swal.fire({
        title: auto ? "Tiempo finalizado ⏰" : "Examen finalizado 🎉",
        text: auto
          ? "El tiempo terminó. Tus respuestas fueron guardadas automáticamente."
          : "Tus respuestas han sido enviadas correctamente.",
        icon: "success",
        confirmButtonText: "Ver resultados",
      }).then(() => {
        Swal.fire({
          title: "Redirigiendo...",
          text: "Volviendo al panel principal.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => navigate("/dashboard"),
        });
      });
    } catch (err) {
      Swal.fire("Error", "No se pudo enviar el examen. Revisa tu conexión.", "error");
    }
  };

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full"></div>
      </div>
    );

  if (!examen) return <p className="text-red-500 text-center mt-10">No se pudo cargar el examen.</p>;

  const preguntaActual = examen.preguntas[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-indigo-700">{examen.titulo}</h1>

        <div className="text-center text-lg font-semibold mb-4">
          Tiempo restante:{" "}
          <span className={tiempoRestante <= 30 ? "text-red-600" : "text-indigo-700"}>
            {minutos}:{segundos.toString().padStart(2, "0")}
          </span>
        </div>

        <p className="text-sm text-gray-600 text-center mb-4">
          Alumno ID: {alumno_id} | Examen ID: {examen_id}
        </p>

        {!finalizado && (
          <>
            <div className="bg-gray-50 p-6 rounded-lg mb-4 shadow-inner flex flex-col md:flex-row items-start gap-4">
              {preguntaActual.imagen && (
                <img
                  src={preguntaActual.imagen}
                  alt={`Pregunta ${currentIndex + 1}`}
                  className="max-w-full md:max-w-[250px] h-auto rounded-lg"
                />
              )}
              {preguntaActual.enunciado && (
                <p className="text-lg text-gray-800">{preguntaActual.enunciado}</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-4 shadow-inner">
              {preguntaActual.opciones.map((op) => (
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
    </div>
  );
};

export default ExamenView;
