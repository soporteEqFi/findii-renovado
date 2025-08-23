import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, validateToken } from '../services/authService';
import { User } from '../types/user';

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for token and user data in localStorage
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Desactivar validación de token temporalmente
          // const isValid = await validateToken();

          // Asumir que el token es válido si existe
          const isValid = true;

          if (isValid) {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use the loginUser function from our API service
      const data = await loginUser(email, password);

      // Extract user data from the response (handle different formats)
      let userData: any;
      if (data.usuario && Array.isArray(data.usuario)) {
        userData = data.usuario[0];
      } else if (data.usuario) {
        userData = data.usuario;
      } else if (data.user) {
        userData = data.user;
      } else if (data.data) {
        userData = data.data;
      } else {
        throw new Error('No se encontraron datos de usuario en la respuesta');
      }
      // Map API response to our User type
      const userObj: User = {
        id: Number(userData.id || userData.id_usuario || 1),
        nombre: (userData.nombre || userData.name || userData.username || email),
        rol: (data.rol || userData.rol || userData.role || 'user').toLowerCase() as string,
        cedula: (userData.cedula || userData.numero_documento || '1'),
        email: email,
        empresa: userData.empresa || '',
        password: undefined,
        imagen_aliado: userData.imagen_aliado || null,
        apellido: userData.apellido || '',
        usuario: userData.usuario || '',
        info_extra: data.info_extra || userData.info_extra || null
      };
      // Save token and user data
      setToken(data.access_token || '');
      setUser(userObj);

      // Store in localStorage for persistence
      localStorage.setItem('access_token', data.access_token || '');
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('cedula', userObj.cedula);
      localStorage.setItem('user_id', userObj.id.toString());

      // Objeto guardado en localStorage

    } catch (error) {
      console.error('Login error:', error);

      // Clear any partial data
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('cedula');
      localStorage.removeItem('user_id');

      // Re-throw the error with more specific message
      if (error instanceof Error) {
        throw new Error(`Error de login: ${error.message}`);
      } else {
        throw new Error('Error desconocido durante el login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
  };

  // Valor del contexto
  const value = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;