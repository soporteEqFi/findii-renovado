import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, Settings, LogOut, UserCog, User, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationManager } from './NotificationManager';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user && (user.rol === 'admin' || user.rol === 'supervisor');

  // Definir elementos de menú basados en el rol
  const menuItems = [
    { icon: Users, label: 'Inicio', path: '/' },
    { icon: BarChart3, label: 'Estadísticas', path: '/statistics' },
    { icon: User, label: 'Perfil', path: '/profile' },
    // { icon: Settings, label: 'Test', path: '/test' }, // Ocultado
  ];

  // Agregar elementos solo para administradores
  const adminMenuItems = [
    { icon: Settings, label: 'Configuración', path: '/config' },
    { icon: UserCog, label: 'Usuarios', path: '/users' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 shadow-lg">
      <div className="flex justify-center mt-6">
        {user?.imagen_aliado && (
          <img src={user.imagen_aliado} alt="Logo del aliado" className="h-20 object-contain" />
        )}
      </div>
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold text-white">{user?.empresa || 'Empresa'}</h1>
        {user && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="text-red">{user.nombre}</p>
            <p className="text-xs bg-white text-slate-900 inline-block px-4 py-1 rounded-full mt-1">{user.rol}</p>
            <div className="mt-2">
              <NotificationManager empresaId={parseInt(localStorage.getItem('empresa_id') || '1')} />
            </div>
          </div>
        )}
      </div>
      <nav className="mt-6">
        {/* Elementos de menú comunes */}
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-slate-700 ${
                location.pathname === item.path
                  ? 'bg-slate-700 text-white font-bold border-l-4 border-blue-500'
                  : 'text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          </li>
        ))}

        {/* Elementos de menú solo para administradores */}
        {isAdmin && adminMenuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-slate-700 ${
                location.pathname === item.path
                  ? 'bg-slate-700 text-white font-bold border-l-4 border-blue-500'
                  : 'text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          </li>
        ))}
      </nav>
      <div>
      <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-white hover:bg-gray-100 hover:text-slate-900 w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;