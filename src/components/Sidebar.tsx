import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, Settings, LogOut, UserCog, User, BarChart3, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationManager } from './NotificationManager';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user && (user.rol === 'admin' || user.rol === 'supervisor');

  // Definir elementos de menú basados en el rol
  const menuItems = [
    { icon: Users, label: 'Inicio', path: '/' },
    { icon: BarChart3, label: 'Estadísticas', path: '/statistics' },
    { icon: GraduationCap, label: 'Academia', path: 'https://drive.google.com/drive/folders/1MzDWIZUnS3L-3oQvleyCe9n3v7opmJA1?usp=drive_link', external: true },
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
    <div className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-64 lg:w-64 md:w-16
      bg-slate-900 shadow-lg
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex justify-center mt-6">
        {user?.imagen_aliado && (
          <img src={user.imagen_aliado} alt="Logo del aliado" className="h-20 object-contain md:h-12 lg:h-20" />
        )}
      </div>
      <div className="flex flex-col items-center p-6 md:p-2 lg:p-6">
        <h1 className="text-2xl font-bold text-white md:hidden lg:block">{user?.empresa || 'Empresa'}</h1>
        {user && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="text-red md:hidden lg:block">{user.nombre}</p>
            <p className="text-xs bg-white text-slate-900 inline-block px-4 py-1 rounded-full mt-1 md:hidden lg:block">{user.rol}</p>
            <div className="mt-2 md:hidden lg:block">
              <NotificationManager empresaId={parseInt(localStorage.getItem('empresa_id') || '1')} />
            </div>
          </div>
        )}
      </div>
      <nav className="mt-6">
        {/* Elementos de menú comunes */}
        {menuItems.map((item) => (
          <li key={item.path}>
            {item.external ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center px-6 py-3 hover:bg-slate-700 md:px-3 lg:px-6 md:justify-center lg:justify-start text-gray-300"
                title={item.label}
              >
                <item.icon className="w-5 h-5 mr-3 md:mr-0 lg:mr-3" />
                <span className="md:hidden lg:block">{item.label}</span>
              </a>
            ) : (
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-6 py-3 hover:bg-slate-700 md:px-3 lg:px-6 md:justify-center lg:justify-start ${
                  location.pathname === item.path
                    ? 'bg-slate-700 text-white font-bold border-l-4 border-blue-500'
                    : 'text-gray-300'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 mr-3 md:mr-0 lg:mr-3" />
                <span className="md:hidden lg:block">{item.label}</span>
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
              className={`flex items-center px-6 py-3 hover:bg-slate-700 md:px-3 lg:px-6 md:justify-center lg:justify-start ${
                location.pathname === item.path
                  ? 'bg-slate-700 text-white font-bold border-l-4 border-blue-500'
                  : 'text-gray-300'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5 mr-3 md:mr-0 lg:mr-3" />
              <span className="md:hidden lg:block">{item.label}</span>
            </Link>
          </li>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full">
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-white hover:bg-gray-100 hover:text-slate-900 w-full md:px-3 lg:px-6 md:justify-center lg:justify-start"
          title="Salir"
        >
          <LogOut className="w-5 h-5 mr-3 md:mr-0 lg:mr-3" />
          <span className="md:hidden lg:block">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;