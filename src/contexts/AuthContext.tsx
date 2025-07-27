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
          // Validate the token with the server
          const isValid = await validateToken();
          
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
      
      // Extract user data from the response
      const userData = data.usuario[0];

      // Datos del backend para debugging
      
      // Map API response to our User type
      const userObj: User = {
        id: Number(userData.id || userData.id_usuario || 1),
        nombre: (userData.nombre || userData.name || userData.username || email),
        rol: (data.rol || userData.role || 'user').toLowerCase() as string,
        cedula: (userData.cedula || userData.numero_documento || '1'),
        email: email,
        empresa: userData.empresa || '',
        password: undefined,
        imagen_aliado: userData.imagen_aliado || null,
        apellido: userData.apellido,
        usuario: userData.usuario
      };
      
      // Objeto guardado para debugging
      
      // Save token and user data
      setToken(data.access_token);
      setUser(userObj);
      
      // Store in localStorage for persistence
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Objeto guardado en localStorage
      
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial data
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      throw error;
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