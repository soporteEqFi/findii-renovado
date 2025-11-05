import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { Menu, X } from 'lucide-react';
import { EditModalProvider } from '../../contexts/EditModalContext';
import { GlobalEditModal } from '../GlobalEditModal';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <EditModalProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Mobile Header with Hamburger Menu */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 dark:bg-slate-950 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={toggleSidebar}
              className="text-white dark:text-gray-100 hover:text-gray-300 dark:hover:text-gray-400 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-white dark:text-gray-100 font-semibold text-lg">Oneplatform</h1>
            <div className="w-6 h-6"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto transition-all duration-300 lg:ml-0">
          {/* Mobile spacing for fixed header */}
          <div className="lg:hidden h-16"></div>
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>

        {/* Global Edit Modal */}
        <GlobalEditModal />
      </div>
    </EditModalProvider>
  );
};

export default Layout;