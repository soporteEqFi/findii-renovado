import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const menuItems = [
    { icon: Users, label: 'Customers', path: '/' },
    { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const loadStats = async () => {
    try {
      setError(null); 

      const user_document = localStorage.getItem('user');
      const userData = JSON.parse(user_document || '{}');
      const user_document_obj = userData.cedula;

      console.log(user_document_obj);

      const response = await fetch(`http://127.0.0.1:5000/get-user-info/${user_document_obj}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });


      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      console.log(data);
      console.log(data["imagen_aliado"]);
      setImage(data["imagen_aliado"]);
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 shadow-lg">
      <div className="flex justify-center mt-6">
        {image && (
          <img src={image} alt="Logo del aliado" className="h-20 object-contain" />
        )}
      </div>
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold text-white">React CRM</h1>
        {user && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="text-white">{user.name}</p>
            <p className="text-xs bg-white text-slate-900 inline-block px-4 py-1 rounded-full mt-1">{user.role}</p>
          </div>
        )}
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-white hover:bg-gray-100 hover:text-slate-900 ${
                isActive ? 'bg-gray-100 text-slate-900 font-bold border-l-4 border-blue-500' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-white hover:bg-gray-100 hover:text-slate-900 w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;