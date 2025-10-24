import api from "./api";

export interface User {
  user_id: number;
  id: number;
  name: string;
  email?: string;
  role: "admin" | "alumno";
  CI?: string;
  curso_id?: number;
  grado?: string;
  paralelo?: string;
}

let token: string | null = localStorage.getItem("token");
let currentUser: User | null = null;

// 🟩 Iniciar sesión (ahora detecta el rol)
export const login = async (
  data: { email?: string; password?: string; CI?: string; role: "admin" | "alumno"}
): Promise<User> => {
  if (data.role === "admin") {
    // 🔸 Login de administrador
    const response = await api.post("/login", {
      email: data.email,
      password: data.password,
    });

    token = response.data.token;
    currentUser = { ...response.data.user, role: "admin" };
    localStorage.setItem("token", token);
    return currentUser;
  }

  if (data.role === "alumno") {
    // 🔸 Login de alumno por CI
    const response = await api.post("/usuarios/view/alumna", { CI: data.CI });

    currentUser = {
      ...response.data,
      role: "alumno",
    };

    // Los alumnos no usan token JWT, pero guardamos algo para mantener sesión
    localStorage.setItem("token", "alumno-session");
    return currentUser;
  }

  throw new Error("Rol no válido");
};

// 🟩 Obtener perfil actual
export const getProfile = async (): Promise<User> => {
  const savedToken = localStorage.getItem("token");

  if (!savedToken) throw new Error("No autenticado");
  if (currentUser) return currentUser;

  // Si es una sesión de alumno sin JWT, lo devolvemos desde memoria
  if (savedToken === "alumno-session" && currentUser?.role === "alumno") {
    return currentUser;
  }

  // Si es admin, consultamos /me
  const response = await api.get("/me");
  currentUser = { ...response.data, role: "admin" };
  return currentUser;
};

// 🟥 Cerrar sesión
export const logout = () => {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
};
