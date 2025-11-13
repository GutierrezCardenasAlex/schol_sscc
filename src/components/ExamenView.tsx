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

  const { alumno_id, examen_id, duracion_minutos } = data as {
    alumno_id: number;
    examen_id: number;
    duracion_minutos: number;
  };

  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: number]: number }>(
    {}
  );
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [finalizado, setFinalizado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number>(
    duracion_minutos * 60
  );

  const tiempoStorageKey = `examen_${examen_id}_tiempo`;

  // Recuperar tiempo desde localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem(tiempoStorageKey);
    if (savedTime) {
      const tiempo = Number(savedTime);
      if (!isNaN(tiempo) && tiempo > 0) {
        setTiempoRestante(tiempo);
      }
    }
  }, [tiempoStorageKey]);

  // Contador regresivo
  useEffect(() => {
    if (finalizado) return;

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalizar(true); // Auto-finalizar
          return 0;
        }
        localStorage.setItem(tiempoStorageKey, String(prev - 1));
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finalizado, tiempoStorageKey]);

  // Guardar últimos datos en localStorage
  useEffect(() => {
    if (!alumno_id || !examen_id) {
      Swal.fire("Error", "No se encontró la información del examen", "error").then(
        () => navigate("/dashboard")
      );
      return;
    }
    localStorage.setItem(
      "ultimo_examen",
      JSON.stringify({ alumno_id, examen_id, duracion_minutos })
    );
  }, [alumno_id, examen_id, duracion_minutos, navigate]);

  // Cargar examen
  useEffect(() => {
    const fetchExamen = async () => {
      Swal.fire({
        title: "Cargando examen...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const res = await api.get(`/evaluacion/${examen_id}`);
        setExamen(res.data.examen);
        Swal.close();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo cargar el examen.", "error").then(() =>
          navigate("/dashboard")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExamen();
  }, [examen_id, navigate]);

  // Seleccionar opción
  const handleSelectOpcion = (preguntaId: number, opcionId: number) => {
    if (finalizado) return;
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
  };

  // 🚀 Navegación mejorada
  const handleNext = () => {
    setCurrentIndex((idx) => Math.min(idx + 1, examen!.preguntas.length - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0)); // ← corregido
  };

  // Finalizar examen
  const handleFinalizar = async (auto = false) => {
    if (!examen || finalizado) return;

    if (!auto) {
      const confirm = await Swal.fire({
        title: "¿Finalizar examen?",
        text: "Se guardarán tus respuestas.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, finalizar",
        cancelButtonText: "Cancelar",
      });
      if (!confirm.isConfirmed) return;
    }

    const respuestasArray = examen.preguntas.map((p) => ({
      pregunta_id: p.id,
      opcion_id: respuestas[p.id] ?? -1, // null => -1
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
        icon: "success",
        confirmButtonText: "Ver resultados",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (err) {
      Swal.fire("Error", "No se pudo enviar el examen.", "error");
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

  if (!examen)
    return (
      <p className="text-red-500 text-center mt-10">
        No se pudo cargar el examen.
      </p>
    );

  const preguntaActual = examen.preguntas[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">

        {/* Título */}
        <h1 className="text-3xl font-bold mb-2 text-center text-indigo-700">
          {examen.titulo}
        </h1>

        {/* Contador */}
        <div className="text-center text-lg font-semibold mb-4">
          Tiempo restante:{" "}
          <span
            className={tiempoRestante <= 30 ? "text-red-600" : "text-indigo-700"}
          >
            {minutos}:{segundos.toString().padStart(2, "0")}
          </span>
        </div>

        {/* ➤ Progreso */}
        <p className="text-center text-gray-700 mb-4">
          Pregunta <b>{currentIndex + 1}</b> de <b>{examen.preguntas.length}</b>
        </p>

        {!finalizado && (
          <>
            {/* Enunciado */}
            <div className="bg-gray-50 p-6 rounded-lg mb-4 shadow-inner flex flex-col md:flex-row gap-4">
              {preguntaActual.imagen && (
                <img
  src={preguntaActual.imagen}
  alt=""
  className="w-[80%] h-[50%] rounded object-cover"
/>
              )}
              <p className="text-lg text-gray-800">{preguntaActual.enunciado}</p>
            </div>

            {/* Opciones */}
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

            {/* Botones navegación */}
            <div className="flex justify-between mb-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === examen.preguntas.length - 1}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded"
              >
                Siguiente
              </button>
            </div>

            <button
              onClick={() => handleFinalizar(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mb-4"
            >
              Finalizar Examen
            </button>
          </>
        )}

        {/* Resultado */}
        {finalizado && resultado && (
          <div className="mt-6 bg-green-100 p-6 rounded-lg text-center">
            <h3 className="font-semibold text-green-700 mb-2">
              {resultado.mensaje}
            </h3>
            <p>
              Correctas: {resultado.respuestas_correctas} /{" "}
              {resultado.total_preguntas}
            </p>
            <p>Puntaje: {resultado.puntaje}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamenView;
