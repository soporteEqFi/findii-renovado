import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Users, label: 'Customers', path: '/' },
    { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">React CRM</h1>
        {user && (
          <div className="mt-2 text-sm text-gray-600">
            <p>{user.name}</p>
            <p className="text-xs bg-gray-100 inline-block px-2 py-1 rounded-full mt-1">{user.role}</p>
          </div>
        )}
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-white hover:bg-gray-100 ${
                isActive ? 'bg-gray-100 text-black border-l-4 border-blue-500' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 text-white hover:bg-gray-100 w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;