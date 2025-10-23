import React, { useState, useRef } from "react";
import api from "../services/api";
import Swal from "sweetalert2";


import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
} from "lucide-react";

interface Props {
  docenteAsigId: number;
  isOpen: boolean;
  onClose: () => void;
}

const AsignarMateriasModal: React.FC<Props> = ({
  docenteAsigId,
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const abortController = useRef<AbortController | null>(null);

  if (!isOpen) return null; // si no está abierto, no renderiza nada

  const validateExcel = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return ext === ".xls" || ext === ".xlsx";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!validateExcel(f)) {
      setError("Solo se permiten archivos Excel (.xls o .xlsx)");
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleUpload = async () => {
  if (!file) return Swal.fire("Error", "Debes seleccionar un archivo Excel.", "error");

  setLoading(true);
  setProgress(0);
  abortController.current = new AbortController();

  try {
    const form = new FormData();
    form.append("file", file);

    const res = await api.post(
      `/usuarios/asig/docente/${docenteAsigId}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        signal: abortController.current.signal,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total || 1));
          setProgress(percent);
        },
      }
    );

    // Éxito
    Swal.fire("¡Éxito!", "Archivo subido correctamente.", "success");
  } catch (err: any) {
    if (err.name === "CanceledError") {
      Swal.fire("Cancelado", "Carga cancelada por el usuario.", "warning");
    } else if (err.response && err.response.data) {
      // Mostrar mensaje del backend
      const backendMessage = err.response.data.message || "Error al subir el archivo";
      Swal.fire("Error", backendMessage, "error");
    } else {
      Swal.fire("Error", "Error al subir el archivo.", "error");
    }
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    if (abortController.current) {
      abortController.current.abort();
      setError("Proceso cancelado.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <XCircle size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-green-700 text-center">
          Asignar Materias al Docente #{docenteAsigId}
        </h2>

        {/* Mensajes */}
        {error && (
          <div className="flex items-center text-red-700 bg-red-50 border border-red-300 rounded-lg p-3 mb-3">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="flex items-center text-green-700 bg-green-50 border border-green-300 rounded-lg p-3 mb-3">
            <CheckCircle className="mr-2" />
            <span>{message}</span>
          </div>
        )}

        {/* Área de carga */}
        <div className="border rounded-lg p-6 bg-green-50 text-center">
          {file ? (
            <div className="bg-green-100 border border-green-400 rounded-xl p-5">
              <div className="flex flex-col items-center">
                <CheckCircle className="text-green-600 w-12 h-12 mb-2 animate-bounce" />
                <p className="font-semibold text-green-700">
                  Archivo listo: {file.name}
                </p>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-400 rounded-lg cursor-pointer hover:bg-green-100 transition">
              <Upload className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm text-gray-600">
                Haz clic o arrastra tu archivo Excel aquí
              </span>
              <input
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" /> Subiendo...
              </span>
            ) : (
              "Subir y Asignar"
            )}
          </button>
        </div>

        {/* Progreso */}
        {loading && (
          <>
            <div className="w-full bg-gray-200 h-3 rounded mt-4 mb-2">
              <div
                className="bg-green-600 h-3 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={handleCancel}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Cancelar
            </button>
          </>
        )}

        {/* Resumen */}
        {summary && (
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg mt-6 shadow-inner">
            <h3 className="font-semibold text-lg mb-2 text-gray-700">
              Resultado:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <strong>Total:</strong> {summary.total ?? "—"}
              </li>
              <li>
                <strong>Exitosas:</strong> {summary.exitosas ?? "—"}
              </li>
              <li>
                <strong>Errores:</strong> {summary.errores ?? "—"}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignarMateriasModal;
