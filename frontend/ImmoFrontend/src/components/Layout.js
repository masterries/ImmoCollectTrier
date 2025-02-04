import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, List, PieChart, Map, Settings } from 'lucide-react';
const Layout = ({ children }) => {
    const location = useLocation();
    const isActive = (path) => {
        return location.pathname === path;
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "fixed top-0 left-0 h-screen w-16 bg-white border-r border-gray-200 z-50", children: _jsxs("div", { className: "flex flex-col items-center py-4 space-y-8", children: [_jsx("div", { className: "p-2", children: _jsx(Link, { to: "/", children: _jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center", children: _jsx(Home, { className: "w-6 h-6 text-blue-600" }) }) }) }), _jsxs("nav", { className: "flex flex-col space-y-4", children: [_jsx(Link, { to: "/", children: _jsx("button", { className: `p-3 rounded-xl ${isActive('/')
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100'} transition-colors`, title: "Dashboard", children: _jsx(BarChart3, { className: "w-6 h-6" }) }) }), _jsx(Link, { to: "/list", children: _jsx("button", { className: `p-3 rounded-xl ${isActive('/list')
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100'} transition-colors`, title: "Property List", children: _jsx(List, { className: "w-6 h-6" }) }) }), _jsx(Link, { to: "/analytics", children: _jsx("button", { className: `p-3 rounded-xl ${isActive('/analytics')
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100'} transition-colors`, title: "Analytics", children: _jsx(PieChart, { className: "w-6 h-6" }) }) }), _jsx("button", { className: "p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors", title: "Map View", children: _jsx(Map, { className: "w-6 h-6" }) }), _jsx("button", { className: "p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors", title: "Settings", children: _jsx(Settings, { className: "w-6 h-6" }) })] })] }) }), _jsx("div", { className: "ml-16 min-h-screen w-[calc(100%-4rem)]", children: _jsx("div", { className: "container mx-auto p-8", children: children }) })] }));
};
export default Layout;
