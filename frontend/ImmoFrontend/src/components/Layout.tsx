// src/components/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, List, PieChart, Map, Settings } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-16 bg-white border-r border-gray-200 z-50">
        <div className="flex flex-col items-center py-4 space-y-8">
          <div className="p-2">
            <Link to="/">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </Link>
          </div>
          
          <nav className="flex flex-col space-y-4">
            <Link to="/">
              <button 
                className={`p-3 rounded-xl ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                title="Dashboard"
              >
                <BarChart3 className="w-6 h-6" />
              </button>
            </Link>
            
            <Link to="/list">
              <button 
                className={`p-3 rounded-xl ${
                  isActive('/list') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                title="Property List"
              >
                <List className="w-6 h-6" />
              </button>
            </Link>
            
            <Link to="/analytics">
              <button 
                className={`p-3 rounded-xl ${
                  isActive('/analytics') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                title="Analytics"
              >
                <PieChart className="w-6 h-6" />
              </button>
            </Link>

            <button 
              className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              title="Map View"
            >
              <Map className="w-6 h-6" />
            </button>
            
            <button 
              className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 min-h-screen w-[calc(100%-4rem)]">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;