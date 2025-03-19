import { useState, useEffect } from 'react';

interface User {
  cedula: string;
  nombre?: string;
  email?: string;
  rol?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Aquí puedes implementar la lógica para obtener el usuario actual
    // Por ejemplo, desde localStorage o una sesión
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};
