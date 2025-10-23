import { useEffect, useState } from "react";
import api from "../services/api";

interface ExamenCronometroProps {
  examen_id: number;
  alumno_id: number;
}

const ExamenCronometro: React.FC<ExamenCronometroProps> = ({ examen_id, alumno_id }) => {
  const [examen, setExamen] = useState<any>(null);
  const [tiempoFormato, setTiempoFormato] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;


    const fetchCronometro = async () => {
      try {
        const res = await api.post(`/examen/cronometro`, { examen_id, alumno_id });
        setTiempoFormato(res.data.tiempo_restante_formato);
        setExamen(res.data);
      } catch (err) {
        console.error("Error al obtener cronómetro:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCronometro();
    intervalId = setInterval(fetchCronometro, 1000);

    return () => clearInterval(intervalId);
  }, [examen_id, alumno_id]);

  return (
    <div style={{ textAlign: "center", fontSize: "1.5rem", marginTop: "1rem" }}>
      {loading ? (
        <p>Cargando cronómetro...</p>
      ) : (
        <>
          <p>⏰ Tiempo restante: <strong>{tiempoFormato}</strong></p>
          <p>Estado: {examen?.estado}</p>
        </>
      )}
    </div>
  );
};

export default ExamenCronometro;
