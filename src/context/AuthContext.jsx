// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, getAuth, logout as clearAuth } from "../lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  // 🧠 Load existing auth from localStorage on startup
  useEffect(() => {
    const saved = getAuth();
    if (saved) setAuth(saved);
  }, []);

  // ✅ Login + update both state and localStorage
  const login = async (email, password, role = "admin") => {
    const data = await loginUser(email, password, role);
    setAuth(data); // ⬅️ context updates immediately
    return data;
  };

  // ✅ Logout clears both context and localStorage
  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
