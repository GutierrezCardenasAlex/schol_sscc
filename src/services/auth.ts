export interface User {
  id: number;
  name: string;
  CI: string;
  email?: string;
  role: "admin" | "alumno";
  estado: string;
  created_at: string;
  updated_at: string;
}

let token: string | null = null;
let currentUser: User | null = null;

// Simulación de login
export const login = async (data: { email?: string; password?: string; CI?: string; role: "admin" | "alumno" }): Promise<User> => {
  const users: User[] = [
    {
      id: 1,
      name: "Admin User",
      CI: "00000001",
      email: "admin@ejemplo.com",
      role: "admin",
      estado: "activo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      
      name: "Alumno Prueba",
      CI: "12345678",
      role: "alumno",
      estado: "activo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  let user: User | null = null;

  if (data.role === "admin") {
    if (!data.email || !data.password) throw new Error("Faltan credenciales");
    user = users.find(u => u.email === data.email && u.role === "admin") || null;
    if (!user) throw new Error("Email o contraseña incorrectos");
  } else if (data.role === "alumno") {
    if (!data.CI) throw new Error("Falta CI");
    user = users.find(u => u.CI === data.CI && u.role === "alumno") || null;
    if (!user) throw new Error("CI incorrecto");
  }

  token = "fake-jwt-token-" + user!.id;
  localStorage.setItem("token", token);
  currentUser = user!;
  return user;
};

// Obtener perfil
export const getProfile = async (): Promise<User> => {
  if (!token || !currentUser) throw new Error("No autenticado");
  return currentUser;
};

// Logout
export const logout = () => {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
};
