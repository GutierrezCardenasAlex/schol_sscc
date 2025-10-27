import React, { useState, useRef } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import {
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Summary {
  total?: number;
  exitosas?: number;
  errores?: number;
  detallesErrores?: any[];
}

const InteractiveSequentialImport: React.FC = () => {
  const [userFile, setUserFile] = useState<File | null>(null);
  const [asigFile, setAsigFile] = useState<File | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    datos?: Summary;
    asignaciones?: Summary;
    progreso?: number;
  }>({});
  const [confirmNext, setConfirmNext] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const validateExcel = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return ext === ".xls" || ext === ".xlsx";
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: any
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateExcel(file)) {
      setError("Solo se permiten archivos Excel (.xls/.xlsx)");
      setFile(null);
      return;
    }
    setError(null);
    setFile(file);
  };

  const uploadFile = async (
    file: File,
    url: string,
    startPercent: number,
    endPercent: number
  ) => {
    const form = new FormData();
    form.append("file", file);

    const res = await api.post(url, form, {
      headers: { "Content-Type": "multipart/form-data" },
      signal: abortController.current?.signal,
      onUploadProgress: (e) => {
        const percent =
          startPercent +
          (e.loaded / (e.total || 1)) * (endPercent - startPercent);
        setProgress(Math.round(percent));
      },
    });
    return res.data;
  };

  const confirmImport = async (message: string) => {
    const result = await Swal.fire({
      title: "⚠️ Atención",
      html: `<p>${message}</p><p class="text-sm text-gray-600 mt-2">Si deseas cambiar el archivo, puedes cancelarlo y subir uno nuevo.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar / Cambiar archivo",
      reverseButtons: true,
      focusCancel: true,
    });
    return result.isConfirmed;
  };

  const handleUserImport = async () => {
    if (!userFile) return setError("Selecciona un archivo de usuarios.");

    const confirmed = await confirmImport(
      "Esta acción borrará los datos existentes en la base de datos."
    );
    if (!confirmed) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setMessage(null);
    abortController.current = new AbortController();

    try {
      const res = await uploadFile(userFile, "/import/users-all", 0, 50);

      if (
        !res.success &&
        !res.message?.toLowerCase().includes("correctamente")
      ) {
        throw new Error(res.message || "Error importando usuarios");
      }

      setSummary((prev) => ({
        ...prev,
        datos: res.summary || {},
        progreso: prev.asignaciones ? 100 : 50,
      }));
      setMessage(res.message || "✅ Usuarios importados correctamente.");
      setConfirmNext(true);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleAsigImport = async () => {
    if (!asigFile) return setError("Selecciona un archivo de asignaciones.");

    const confirmed = await confirmImport(
      "Esta acción puede sobrescribir asignaciones existentes."
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setProgress(50);
    abortController.current = new AbortController();

    try {
      const res = await uploadFile(asigFile, "/import/asignacion-all", 50, 100);

      if (
        !res.success &&
        !res.message?.toLowerCase().includes("correctamente")
      ) {
        throw new Error(res.message || "Error importando asignaciones");
      }

      setSummary((prev) => ({
        ...prev,
        asignaciones: res.summary || {},
        progreso: 100,
      }));
      setMessage(
        res.message ||
          "✅ Asignaciones importadas correctamente. Proceso finalizado."
      );
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    if (abortController.current) abortController.current.abort();
  };

  const handleConfirmNext = () => {
    setConfirmNext(false);
    setStep(2);
  };

  const handleSkipNext = () => {
    setConfirmNext(false);
    setStep(4);
    setMessage("Proceso finalizado sin subir asignaciones.");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Importar Datos
      </h2>

      {error && (
        <div className="flex items-center text-red-600 bg-red-50 border border-red-300 rounded-lg p-3 mb-3">
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

      {/* Paso 1: Usuarios */}
      {step === 1 && (
        <div className="border rounded-lg p-6 bg-blue-50 shadow-sm">
          <div className="flex items-center gap-3">
            {userFile ? (
              <div className="w-full text-center bg-blue-100 border border-blue-400 rounded-xl p-6 shadow-inner transition">
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-green-600 w-12 h-12 mb-2 animate-bounce" />
                  <p className="font-semibold text-blue-700 text-lg">
                    Archivo cargado correctamente
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{userFile.name}</p>
                  <button
                    className="mt-2 text-sm text-blue-600 underline"
                    onClick={() => setUserFile(null)}
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                <Upload className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-sm text-gray-600">
                  Haz clic o arrastra tu archivo aquí
                </span>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setUserFile)}
                />
              </label>
            )}
          </div>

          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
            disabled={loading || !userFile}
            onClick={handleUserImport}
          >
            {loading ? "Importando..." : "Importar Datos"}
          </button>
        </div>
      )}

      {/* Confirmación para subir asignaciones */}
      {confirmNext && step === 2 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mt-5 text-center">
          <p className="text-lg mb-3 font-medium text-yellow-800">
            ¿Deseas subir el archivo de asignaciones ahora?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleConfirmNext}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Sí, subir asignaciones
            </button>
            <button
              onClick={handleSkipNext}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Omitir
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Asignaciones */}
      {step === 2 && !confirmNext && (
        <div className="border rounded-lg p-6 bg-green-50 shadow-sm mt-5">
          <div className="flex items-center gap-3">
            {asigFile ? (
              <div className="w-full text-center bg-green-100 border border-green-400 rounded-xl p-6 shadow-inner transition">
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-green-600 w-12 h-12 mb-2 animate-bounce" />
                  <p className="font-semibold text-green-700 text-lg">
                    Archivo cargado correctamente
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{asigFile.name}</p>
                  <button
                    className="mt-2 text-sm text-green-600 underline"
                    onClick={() => setAsigFile(null)}
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-400 rounded-lg cursor-pointer hover:bg-green-100 transition">
                <Upload className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-sm text-gray-600">
                  Haz clic o arrastra tu archivo aquí
                </span>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setAsigFile)}
                />
              </label>
            )}
          </div>

          <button
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
            disabled={loading || !asigFile}
            onClick={handleAsigImport}
          >
            {loading ? "Importando..." : "Importar Asignaciones"}
          </button>
        </div>
      )}

      {/* Barra de progreso */}
      {loading && (
        <div className="w-full bg-gray-200 h-3 rounded mt-4 mb-2">
          <div
            className="bg-blue-600 h-3 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Resumen final */}
      {step === 4 && summary && (
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg mt-6 shadow-inner">
          <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center">
            <CheckCircle className="text-green-500 mr-2" /> Resumen Final
          </h3>

          {summary.progreso && (
            <div className="mb-4">
              <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                <span>Progreso total</span>
                <span>{summary.progreso}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${summary.progreso}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <button
          onClick={handleCancel}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Cancelar Importación
        </button>
      )}
    </div>
  );
};

export default InteractiveSequentialImport;
