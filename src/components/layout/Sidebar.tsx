import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Home, Users, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Rentals', href: '/rentals', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-20 transition-opacity ease-linear duration-300 lg:hidden ${
          isOpen ? 'opacity-100 block' : 'opacity-0 hidden'
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
      </div>

      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-6 lg:py-6">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-900">Menu</span>
          </div>
          <button
            className="p-1 text-gray-400 rounded-md hover:text-gray-500 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X size={20} />
          </button>
        </div>
        
        <div className="px-2 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;