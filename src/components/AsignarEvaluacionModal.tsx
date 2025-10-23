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
  isOpen: boolean;
  onClose: () => void;
}

const SubirEvaluacionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortController = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const validateExcel = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return ext === ".xls" || ext === ".xlsx";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
  const invalidFile = selectedFiles.find(f => !validateExcel(f));
  if (invalidFile) {
    Swal.fire("Error", "Solo se permiten archivos Excel (.xls o .xlsx)", "error");
    return;
  }

  // Acumula archivos antiguos + nuevos
  setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
};


  const handleUpload = async () => {
  if (files.length === 0) {
    return Swal.fire("Error", "Debes seleccionar al menos un archivo Excel.", "error");
  }

  setLoading(true);
  setProgress(0);
  abortController.current = new AbortController();

  try {
    const form = new FormData();
    files.forEach((file) => form.append("archivos[]", file)); // <-- aquí está la clave correcta

    await api.post("/import/evaluation-all", form, {
      headers: { "Content-Type": "multipart/form-data" },
      signal: abortController.current.signal,
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / (e.total || 1));
        setProgress(percent);
      },
    });

    Swal.fire("¡Éxito!", "Archivos subidos correctamente.", "success");
    setFiles([]);
  } catch (err: any) {
    if (err.name === "CanceledError") {
      Swal.fire("Cancelado", "Carga cancelada por el usuario.", "warning");
    } else if (err.response?.data?.message) {
      Swal.fire("Error", err.response.data.message, "error");
    } else {
      Swal.fire("Error", "Error al subir los archivos.", "error");
    }
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    if (abortController.current) {
      abortController.current.abort();
      Swal.fire("Cancelado", "Proceso cancelado.", "warning");
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
          Subir Evaluaciones
        </h2>

        <div className="border rounded-lg p-6 bg-green-50 text-center">
          {files.length > 0 ? (
            <div className="bg-green-100 border border-green-400 rounded-xl p-5 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-center gap-2">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                  <p className="font-semibold text-green-700">{file.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-400 rounded-lg cursor-pointer hover:bg-green-100 transition">
              <Upload className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm text-gray-600">Haz clic o arrastra tus archivos Excel aquí</span>
              <input
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
            </label>
          )}

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" /> Subiendo...
              </span>
            ) : (
              "Subir"
            )}
          </button>
        </div>

        {loading && (
          <>
            <div className="w-full bg-gray-200 h-3 rounded mt-4 mb-2">
              <div className="bg-green-600 h-3 rounded transition-all" style={{ width: `${progress}%` }} />
            </div>
            <button
              onClick={handleCancel}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubirEvaluacionModal;
