import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataStatistics } from '../../utils/dataUtils';
export const LivingSpaceAnalytics = ({ data, title = "Living Space Analysis" }) => {
    // Handle empty data case
    if (!data || data.length === 0) {
        return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: title }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-72 flex items-center justify-center text-gray-500", children: "No data available" }) })] }));
    }
    const stats = getDataStatistics(data);
    const getSpaceDistribution = () => {
        if (data.length === 0)
            return [];
        const min = stats.livingSpace.min;
        const max = stats.livingSpace.max;
        const step = (max - min) / 8;
        const distribution = Array(8).fill(0).map((_, i) => ({
            range: `${(min + step * i).toFixed(0)}-${(min + step * (i + 1)).toFixed(0)}`,
            count: 0
        }));
        data.forEach(item => {
            const index = Math.min(Math.floor((item.Wohnfläche - min) / step), 7);
            if (index >= 0 && index < distribution.length) {
                distribution[index].count++;
            }
        });
        return distribution;
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: title }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Average Living Space" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [stats.livingSpace.avg.toFixed(1), " m\u00B2"] })] }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Median Living Space" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [stats.livingSpace.median.toFixed(1), " m\u00B2"] })] })] }), _jsx("div", { className: "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: getSpaceDistribution(), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "range", angle: -45, textAnchor: "end", height: 70 }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#3b82f6" })] }) }) })] })] }));
};
