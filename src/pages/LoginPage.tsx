import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"admin" | "alumno" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [CI, setCI] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (role === "admin") await login({ email, password, role });
      if (role === "alumno") await login({ CI, role });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!role) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Selecciona tipo de usuario</h2>
        <button onClick={() => setRole("admin")}>Admin</button>
        <button onClick={() => setRole("alumno")}>Alumno</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px", margin: "auto", marginTop: "50px" }}>
      <h2>Login {role}</h2>
      {role === "admin" && (
        <>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        </>
      )}
      {role === "alumno" && (
        <input placeholder="CI" value={CI} onChange={e => setCI(e.target.value)} required />
      )}
      <button type="submit">Ingresar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default LoginPage;
