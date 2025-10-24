import React, { useEffect, useState } from "react";
import { getProfile, User } from "../services/auth";

const ProfileContent = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getProfile().then(setUser).catch(console.error);
  }, []);

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div style={{ maxWidth: "400px", margin: "auto", marginTop: "50px" }}>
      <h2>Perfil del Usuario</h2>
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>CI:</strong> {user.CI}</p>
      <p><strong>Email:</strong> {user.email || "N/A"}</p>
      <p><strong>Rol:</strong> {user.role}</p>
      <p><strong>Curso:</strong> {user.curso_id || "N/A"}</p>
      <p><strong>Grado:</strong> {user.grado || "N/A"}</p>
      <p><strong>Paralelo:</strong> {user.paralelo || "N/A"}</p>
      {/* <p><strong>Paralelo:</strong> {user.user_id || "N/A"}</p> */}
    </div>
  );
};

export default ProfileContent;
