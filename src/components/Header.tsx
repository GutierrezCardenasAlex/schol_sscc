// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, User } from "../services/auth";

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      getProfile()
        .then((data) => setUser(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);
  return (
    <header className="flex justify-between items-center mb-2">
      {user && (
            <h2 className="text-xl text-gray-600 mb-2">
              👋 Bienvenido,{" "}
              <span className="font-semibold text-blue-600">{user.name}</span>
            </h2>
          )}
      <Link
        to="/login"
        className="text-indigo-600 hover:text-indigo-800 font-medium"
      >
        Cerrar Sesión
      </Link>
    </header>
  );
};

export default Header;
