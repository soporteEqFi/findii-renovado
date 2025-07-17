import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Building } from 'lucide-react';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">PropManager</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Administrador</span>
                    <span className="text-xs text-gray-500">admin@example.com</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800">A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;