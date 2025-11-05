import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, Settings, LogOut, UserCog, User, BarChart3, GraduationCap, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationManager } from './NotificationManager';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user && user.rol === 'admin';
  const isSupervisorOrAdmin = user && (user.rol === 'admin' || user.rol === 'supervisor');

  // Definir elementos de menú basados en el rol
  const menuItems = [
    { icon: Users, label: 'Inicio', path: '/' },
    { icon: BarChart3, label: 'Estadísticas', path: '/statistics' },
    { icon: GraduationCap, label: 'Academia', path: 'https://drive.google.com/drive/folders/1jvqpFn5aad7_So20lwKaWrlG2wMXpPES?usp=sharing', external: true },
    { icon: User, label: 'Perfil', path: '/profile' },
    // { icon: Settings, label: 'Test', path: '/test' }, // Ocultado
  ];

  // Agregar elementos solo para administradores
  const adminMenuItems = [
    { icon: Settings, label: 'Configuración', path: '/config' },
  ];

  // Agregar elementos para supervisores y administradores
  const supervisorMenuItems = [
    { icon: UserCog, label: 'Usuarios', path: '/users' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={` sidebar-root
      fixed lg:static inset-y-0 left-0 z-50
      w-64 lg:w-64 md:w-48
      bg-slate-900 dark:bg-slate-950 shadow-lg
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      h-screen flex flex-col overflow-hidden lg:h-auto lg:overflow-visible
      pt-16 lg:pt-0
    `}>
      <div className="flex justify-center mt-4 lg:mt-6">
        {user?.imagen_aliado && (
          <img src={user.imagen_aliado} alt="Logo del aliado" className="logo h-14 object-contain md:h-12 lg:h-20 rounded-full" />
        )}
      </div>
      <div className="flex flex-col items-center p-3 md:p-3 lg:p-6">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white dark:text-gray-100 text-center">{user?.empresa || 'Empresa'}</h1>
        {user && (
          <div className="mt-2 text-sm text-gray-300 dark:text-gray-400 text-center user-info">
            <p className="text-xs md:text-sm lg:text-base text-gray-300 dark:text-gray-400">{user.nombre}</p>
            <p className="inline-block text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-gray-100 px-3 py-1 rounded-full mt-1 user-role">{user.rol}</p>
            <div className="notification-area mt-2 flex justify-center">
              <NotificationManager empresaId={parseInt(localStorage.getItem('empresa_id') || '1')} />
            </div>
          </div>
        )}
      </div>
      <nav className="mt-2 lg:mt-6 flex-1 overflow-y-auto pr-1">
        {/* Elementos de menú comunes */}
        {menuItems.map((item) => (
          <li key={item.path}>
            {item.external ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="menu-item flex items-center px-4 py-2 text-sm hover:bg-slate-700 dark:hover:bg-slate-800 md:px-4 lg:px-6 lg:py-3 md:justify-start lg:justify-start text-gray-300 dark:text-gray-400"
                title={item.label}
              >
                <item.icon className="menu-icon w-4 h-4 mr-3 md:mr-3 lg:mr-3 lg:w-5 lg:h-5" />
                <span className="menu-text text-sm md:text-sm lg:text-base">{item.label}</span>
              </a>
            ) : (
              <Link
                to={item.path}
                onClick={onClose}
                className={`menu-item flex items-center px-4 py-2 text-sm hover:bg-slate-700 dark:hover:bg-slate-800 md:px-4 lg:px-6 lg:py-3 md:justify-start lg:justify-start ${
                  location.pathname === item.path
                    ? 'bg-slate-700 dark:bg-slate-800 text-white dark:text-gray-100 font-bold border-l-4 border-blue-500 dark:border-blue-400'
                    : 'text-gray-300 dark:text-gray-400'
                }`}
                title={item.label}
              >
                <item.icon className="menu-icon w-4 h-4 mr-3 md:mr-3 lg:mr-3 lg:w-5 lg:h-5" />
                <span className="menu-text text-sm md:text-sm lg:text-base">{item.label}</span>
              </Link>
            )}
          </li>
        ))}

        {/* Elementos de menú solo para administradores */}
        {isAdmin && adminMenuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onClose}
              className={`menu-item flex items-center px-4 py-2 text-sm hover:bg-slate-700 dark:hover:bg-slate-800 md:px-4 lg:px-6 lg:py-3 md:justify-start lg:justify-start ${
                location.pathname === item.path
                  ? 'bg-slate-700 dark:bg-slate-800 text-white dark:text-gray-100 font-bold border-l-4 border-blue-500 dark:border-blue-400'
                  : 'text-gray-300 dark:text-gray-400'
              }`}
              title={item.label}
            >
              <item.icon className="menu-icon w-4 h-4 mr-3 md:mr-0 lg:mr-3 lg:w-5 lg:h-5" />
              <span className="menu-text text-sm lg:text-base">{item.label}</span>
            </Link>
          </li>
        ))}

        {/* Elementos de menú para supervisores y administradores */}
        {isSupervisorOrAdmin && supervisorMenuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onClose}
              className={`menu-item flex items-center px-4 py-2 text-sm hover:bg-slate-700 dark:hover:bg-slate-800 md:px-4 lg:px-6 lg:py-3 md:justify-start lg:justify-start ${
                location.pathname === item.path
                  ? 'bg-slate-700 dark:bg-slate-800 text-white dark:text-gray-100 font-bold border-l-4 border-blue-500 dark:border-blue-400'
                  : 'text-gray-300 dark:text-gray-400'
              }`}
              title={item.label}
            >
              <item.icon className="menu-icon w-4 h-4 mr-3 md:mr-0 lg:mr-3 lg:w-5 lg:h-5" />
              <span className="menu-text text-sm lg:text-base">{item.label}</span>
            </Link>
          </li>
        ))}
      </nav>
      <div className="mt-auto w-full border-t border-slate-800 dark:border-slate-700">
        {/* Toggle de tema */}
        <button
          onClick={toggleTheme}
          className="menu-item flex items-center px-4 py-2 text-sm text-gray-300 dark:text-gray-400 hover:bg-slate-700 dark:hover:bg-slate-800 w-full md:px-4 lg:px-6 lg:py-3 md:justify-start lg:justify-start"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="menu-icon w-4 h-4 mr-3 md:mr-3 lg:mr-3 lg:w-5 lg:h-5" />
          ) : (
            <Sun className="menu-icon w-4 h-4 mr-3 md:mr-3 lg:mr-3 lg:w-5 lg:h-5" />
          )}
          <span className="menu-text text-sm md:text-sm lg:text-base">
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="menu-item flex items-center px-4 py-2 text-sm text-white dark:text-gray-100 hover:bg-gray-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-gray-100 w-full md:px-4 lg:px-6 lg:py-3 md:justify-start lg:justify-start"
          title="Salir"
        >
          <LogOut className="menu-icon w-4 h-4 mr-3 md:mr-3 lg:mr-3 lg:w-5 lg:h-5" />
          <span className="menu-text text-sm md:text-sm lg:text-base">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;