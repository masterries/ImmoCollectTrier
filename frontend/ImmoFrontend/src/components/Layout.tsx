import React from 'react';
import { Home, BarChart3, Map, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-16 bg-white border-r border-gray-200 z-50">
        <div className="flex flex-col items-center py-4 space-y-8">
          <div className="p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <nav className="flex flex-col space-y-4">
            <button className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              <BarChart3 className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              <Map className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 min-h-screen w-[calc(100%-4rem)]">
        <div className="container mx-auto p-8">
          <header className="mb-8 flex items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Trier Real Estate
              </h1>
              <p className="text-gray-500 mt-1">
                Market Analytics Dashboard
              </p>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;