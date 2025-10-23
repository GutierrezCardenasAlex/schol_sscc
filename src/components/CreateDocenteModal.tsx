import React, { useState } from "react";
import api from "../services/api";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface CreateDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateDocenteModal: React.FC<CreateDocenteModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    CI: "",
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  if (!isOpen) return null;

  // Actualizar campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Autogenerar contraseña cuando cambian CI o nombre
    if (name === "CI" || name === "name") {
      const nuevoCI = name === "CI" ? value : formData.CI;
      const nuevoNombre = name === "name" ? value : formData.name;

      const primerasLetras = nuevoNombre.trim().substring(0, 3); // primeras 3 letras
      const passwordGenerado = nuevoCI && primerasLetras ? `${nuevoCI}${primerasLetras}` : "";

      setFormData({
        ...formData,
        [name]: value,
        password: passwordGenerado,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post("/usuarios/create/docente", formData);

      toast.success("✅ Docente creado con éxito", {
        style: { background: "#4ade80", color: "white", fontWeight: "600" },
        icon: "🎉",
      });

      console.log(res.data);

      setFormData({
        CI: "",
        name: "",
        email: "",
        password: ""
      });

      onClose();
    } catch (err: any) {
      console.error(err);

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error("⚠️ Verifica los campos del formulario", {
          style: { background: "#f87171", color: "white", fontWeight: "600" },
          icon: "❌",
        });
      } else {
        toast.error("❌ Error al crear el alumno", {
          style: { background: "#ef4444", color: "white", fontWeight: "600" },
          icon: "🚨",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Registrar Docente</h2>
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
              className={`w-full border ${
                errors.CI ? "border-red-500" : "border-gray-300"
              } rounded-lg p-2`}
            />
            {errors.CI && <p className="text-sm text-red-600">{errors.CI[0]}</p>}

            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg p-2`}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg p-2`}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email[0]}</p>}

            {/* Contraseña (autogenerada, solo lectura) */}
            <input
              type="text"
              name="password"
              placeholder="Contraseña generada automáticamente"
              value={formData.password}
              onChange={handleChange}
              readOnly
              autoComplete="off"
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
    </>
  );
};

export default CreateDocenteModal;
