import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { FileSpreadsheet, Loader2 } from "lucide-react";

interface Materia {
  id: number;
  nombre: string;
}

interface Curso {
  id: number;
  curso: string;
}

const ReportContent: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<number | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiasRes, cursosRes] = await Promise.all([
          api.get("/materia/viewall"),
          api.get("/curso/viewall"),
        ]);
        setMaterias(materiasRes.data);
        setCursos(cursosRes.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "No se pudieron cargar las materias o cursos.",
          confirmButtonColor: "#3085d6",
        });
      }
    };
    fetchData();
  }, []);

  const handleDownload = async () => {
    if (!materiaSeleccionada || !cursoSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona todos los campos",
        text: "Debes elegir una materia y un curso antes de descargar.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/reportes/materia/${materiaSeleccionada}/curso/${cursoSeleccionado}`,
        { responseType: "blob" }
      );

      const contentDisposition =
        response.headers["content-disposition"] || response.headers["Content-Disposition"];
      let fileName = "reporte.xlsx";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Descarga completa",
        text: `El archivo "${fileName}" se descargó correctamente.`,
        confirmButtonColor: "#10b981",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al descargar",
        text: "No se pudo descargar el reporte. Intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center gap-2 mb-6">
          <FileSpreadsheet className="text-green-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-800">
            Descargar Reporte de Notas
          </h2>
          <p className="text-gray-500 text-sm">
            Selecciona la materia y el curso para generar el archivo Excel.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Materia
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
            value={materiaSeleccionada ?? ""}
            onChange={(e) => setMateriaSeleccionada(Number(e.target.value))}
          >
            <option value="">-- Selecciona una materia --</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Curso
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
            value={cursoSeleccionado ?? ""}
            onChange={(e) => setCursoSeleccionado(Number(e.target.value))}
          >
            <option value="">-- Selecciona un curso --</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.curso}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-white font-semibold transition-all ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Descargando...
            </>
          ) : (
            <>
              <FileSpreadsheet size={20} /> Descargar Excel
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportContent;
