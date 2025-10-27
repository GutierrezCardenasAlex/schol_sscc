import React, { useState, useEffect } from "react";
import api from "../services/api";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface EditAlumnosModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnoId: number | null;
  onUpdate: (updated: { CI: string; name: string; email: string }) => void;
}

const EditAlumnosModal: React.FC<EditAlumnosModalProps> = ({
  isOpen,
  onClose,
  alumnoId,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({ CI: "", name: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ CI?: string; name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del alumno solo cuando se abra el modal
  useEffect(() => {
    if (isOpen && alumnoId) {
      const fetchAlumno = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/usuarios/view/alumno/${alumnoId}`);
          setFormData({
            CI: res.data.CI,
            name: res.data.name,
            email: res.data.email,
            password: "",
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los datos del alumno.",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchAlumno();
    }
  }, [isOpen, alumnoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.CI.trim()) newErrors.CI = "La cédula es obligatoria";
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El email no es válido";
    if (!formData.password.trim()) newErrors.password = "La contraseña es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumnoId) return;

    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Corrige los errores",
        text: "Por favor completa correctamente el formulario.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/usuarios/edit/alumno/${alumnoId}`, formData);

      // Notificación de éxito
      Swal.fire({
        icon: "success",
        title: "Usuario editado satisfactoriamente",
        showConfirmButton: false,
        timer: 2000,
      });

      onUpdate(formData);
      handleClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        const backendErrors: typeof errors = {};
        for (const key in err.response.data.errors) {
          backendErrors[key as keyof typeof errors] = err.response.data.errors[key][0];
        }
        setErrors(backendErrors);

        Swal.fire({
          icon: "warning",
          title: "Corrige los errores",
          text: "Corrige los errores marcados en el formulario.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el alumno.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative transition-transform transform scale-100 animate-fadeIn">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">Editar Alumno</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Cédula de Identidad</label>
              <input
                type="text"
                name="CI"
                value={formData.CI}
                onChange={handleChange}
                placeholder="Inserte su cédula de identidad"
                className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
                  errors.CI ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
                }`}
              />
              {errors.CI && <p className="text-red-600 text-sm mt-1">{errors.CI}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Nombre completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Corrija su nombre"
                className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
                  errors.name ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Modifique su correo electrónico"
                className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
                  errors.email ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
                }`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Inserte su contraseña"
                className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
                  errors.password ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
                }`}
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAlumnosModal;
