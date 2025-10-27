import React, { useState, useEffect } from "react";
import api from "../services/api";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { X } from "lucide-react";

interface EditDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  docenteId: number | null;
  onUpdate: (updated: { CI: string; name: string; email: string; password: string }) => void;
}

const EditDocenteModal: React.FC<EditDocenteModalProps> = ({
  isOpen,
  onClose,
  docenteId,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({ CI: "", name: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ CI?: string; name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  // Cargar datos del docente solo al abrir modal
  useEffect(() => {
    if (isOpen && docenteId && !toastShown) {
      const fetchDocente = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/usuarios/view/docente/${docenteId}`);
          setFormData({
            CI: res.data.CI,
            name: res.data.name,
            email: res.data.email,
            password: "",
          });

          Swal.fire({
            icon: 'success',
            title: 'Datos cargados',
            text: '📥 Datos del docente cargados correctamente',
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          });

          setToastShown(true);
        } catch (err) {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: '🚨 No se pudieron cargar los datos del docente',
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDocente();
    }
  }, [isOpen, docenteId, toastShown]);

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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "El email no es válido";
    if (!formData.password.trim()) newErrors.password = "La contraseña es obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docenteId) return;

    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: '⚠️ Corrige los errores antes de continuar',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Confirmación antes de actualizar
      const result = await Swal.fire({
        title: '¿Actualizar docente?',
        text: 'Los datos del docente serán actualizados.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      await api.post(`/usuarios/edit/docente/${docenteId}`, formData);

      Swal.fire({
        icon: 'success',
        title: 'Docente actualizado',
        text: `✅ ${formData.name} se actualizó correctamente`,
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
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
          icon: 'error',
          title: 'Error',
          text: '⚠️ Corrige los errores del formulario',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: '❌ No se pudo actualizar el docente',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToastShown(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">Editar Docente</h2>
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
                className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none ${
                  errors.email ? "border-red-500 ring-red-300" : "border-gray-300 ring-blue-400"
                }`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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

export default EditDocenteModal;
