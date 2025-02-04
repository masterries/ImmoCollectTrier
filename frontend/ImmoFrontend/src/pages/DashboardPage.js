import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PropertyFilters from '../components/PropertyFilters';
import HousingAnalytics from '../components/HousingAnalytics';
import { Button } from "@/components/ui/button";
import { ListFilter } from 'lucide-react';
const DashboardPage = ({ data, propertyTypes, ranges }) => {
    return (_jsx(Layout, { children: _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Market Analytics Dashboard" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Overview of the Trier real estate market" })] }), _jsx(Link, { to: "/list", children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(ListFilter, { className: "w-4 h-4" }), "View as List"] }) })] }), _jsx(PropertyFilters, { propertyTypes: propertyTypes, ranges: ranges }), _jsx(HousingAnalytics, { data: data })] }) }));
};
export default DashboardPage;
