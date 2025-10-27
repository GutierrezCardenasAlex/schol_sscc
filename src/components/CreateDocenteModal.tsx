import React, { useState } from "react";
import api from "../services/api";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { X } from "lucide-react";

interface CreateDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onCreate?: (docente: { id: number; CI: string; name: string }) => void; // <-- Nuevo
}

const CreateDocenteModal: React.FC<CreateDocenteModalProps> = ({ isOpen, onClose, onSuccess,onCreate }) => {
  const [formData, setFormData] = useState({
    CI: "",
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "CI" || name === "name") {
      const nuevoCI = name === "CI" ? value : formData.CI;
      const nuevoNombre = name === "name" ? value : formData.name;
      const passwordGenerado = nuevoCI && nuevoNombre ? `${nuevoCI}${nuevoNombre.substring(0,3)}` : "";
      setFormData({ ...formData, [name]: value, password: passwordGenerado });
      return;
    }

    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validación simple
    const newErrors: typeof errors = {};
    if (!formData.CI.trim()) newErrors.CI = "La cédula es obligatoria";
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
    if (!formData.password.trim()) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/usuarios/create/docente", formData);
      if (onSuccess) onSuccess();
      // SweetAlert2 éxito
      await Swal.fire({
        icon: 'success',
        title: 'Docente creado',
        text: `✅ ${formData.name} fue creado correctamente`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      setFormData({ CI: "", name: "", email: "", password: "" });
      if (onCreate && res.data.docente) {
        onCreate(res.data.docente); // <-- docente recién creado desde backend
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        for (const key in err.response.data.errors) {
          backendErrors[key] = err.response.data.errors[key][0];
        }
        setErrors(backendErrors);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: '⚠️ Corrige los campos del formulario',
          toast: true,
          position: 'top-end',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: '❌ Error al crear el docente',
          toast: true,
          position: 'top-end',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">Registrar Docente</h2>
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
            className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
              errors.CI ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
            }`}
          />
          {errors.CI && <p className="text-red-600 text-sm">{errors.CI}</p>}

          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
              errors.name ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
            }`}
          />
          {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
              errors.email ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
            }`}
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

          <input
            type="text"
            name="password"
            placeholder="Contraseña generada automáticamente"
            value={formData.password}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Creando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDocenteModal;
