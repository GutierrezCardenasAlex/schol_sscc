import React, { useEffect, useState } from "react";
import api from "../services/api";

const TestApi: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cambia "/users" por cualquier endpoint que tengas
        const response = await api.get("/usuarios/view/alumnosall");
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando datos de la API...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Datos recibidos de la API:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestApi;
