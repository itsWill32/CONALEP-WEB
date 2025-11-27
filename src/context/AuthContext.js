"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false); // ← FLAG para evitar múltiples llamadas

  useEffect(() => {
    // Solo verificar UNA VEZ
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkAuth();
    }
  }, []); // ← DEPENDENCIAS VACÍAS - solo al montar

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        // No hay sesión
        setLoading(false);
        if (pathname !== '/login') {
          router.replace('/login');
        }
        return;
      }

      // Hay token, verificar si es válido
      try {
        const response = await authService.getProfile();
        setUser(response.data);
        setLoading(false);
        
        // Si está en login y ya tiene sesión, redirigir al dashboard
        if (pathname === '/login') {
          router.replace('/');
        }
      } catch (error) {
        // Token inválido
        console.error('Token inválido:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      }
    } catch (error) {
      console.error('Error en checkAuth:', error);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    hasChecked.current = false; // Reset del flag
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
