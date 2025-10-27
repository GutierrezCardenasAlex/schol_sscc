import React, { useState } from "react";
import api from "../services/api";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface CreateAlumnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 🔹 nuevo
}

const CreateAlumnoModal: React.FC<CreateAlumnoModalProps> = ({ isOpen, onClose, onSuccess  }) => {
  const [formData, setFormData] = useState({
    CI: "",
    name: "",
    email: "",
    password: "",
    grado: "",
    paralelo: "",
    paralelolet: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const paraleloMap: Record<string, string> = {
    BLANCO: "A",
    CELESTE: "B",
    ROSADO: "C",
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "paralelo") {
      setFormData({
        ...formData,
        paralelo: value,
        paralelolet: paraleloMap[value] || "",
      });
      return;
    }

    if (name === "CI" || name === "name") {
      const nuevoCI = name === "CI" ? value : formData.CI;
      const nuevoNombre = name === "name" ? value : formData.name;
      const primerasLetras = nuevoNombre.trim().substring(0, 3);
      const passwordGenerado = nuevoCI && primerasLetras ? `${nuevoCI}${primerasLetras}` : "";

      setFormData({
        ...formData,
        [name]: value,
        password: passwordGenerado,
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post("/usuarios/create/alumnos", formData);

      Swal.fire({
        icon: "success",
        title: "Alumno creado con éxito",
        showConfirmButton: false,
        timer: 2000,
      });
      if (onSuccess) onSuccess();

      setFormData({
        CI: "",
        name: "",
        email: "",
        password: "",
        grado: "",
        paralelo: "",
        paralelolet: "",
      });
      // 🔹 Llamar al callback para refrescar la tabla

      // Cerrar modal
      onClose();
    } catch (err: any) {
      console.error(err);

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);

        Swal.fire({
          icon: "warning",
          title: "Corrige los errores del formulario",
          text: "Verifica los campos marcados en rojo",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear el alumno",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registrar Alumno</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="CI"
            placeholder="Cédula de Identidad"
            value={formData.CI}
            onChange={handleChange}
            className={`w-full border ${errors.CI ? "border-red-500" : "border-gray-300"} rounded-lg p-2`}
          />
          {errors.CI && <p className="text-sm text-red-600">{errors.CI[0]}</p>}

          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg p-2`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg p-2`}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email[0]}</p>}

          <input
            type="text"
            name="password"
            placeholder="Contraseña generada automáticamente"
            value={formData.password}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />

          <select
            name="grado"
            value={formData.grado}
            onChange={handleChange}
            className={`w-full border ${errors.grado ? "border-red-500" : "border-gray-300"} rounded-lg p-2`}
          >
            <option value="">Selecciona el grado</option>
            <option value="PRIMERO">Primero</option>
            <option value="SEGUNDO">Segundo</option>
            <option value="TERCERO">Tercero</option>
            <option value="CUARTO">Cuarto</option>
            <option value="QUINTO">Quinto</option>
            <option value="SEXTO">Sexto</option>
          </select>

          <select
            name="paralelo"
            value={formData.paralelo}
            onChange={handleChange}
            className={`w-full border ${errors.paralelo ? "border-red-500" : "border-gray-300"} rounded-lg p-2`}
          >
            <option value="">Selecciona el paralelo</option>
            <option value="BLANCO">Blanco</option>
            <option value="CELESTE">Celeste</option>
            <option value="ROSADO">Rosado</option>
          </select>

          <input
            type="text"
            name="paralelolet"
            placeholder="Letra del paralelo"
            value={formData.paralelolet}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAlumnoModal;
