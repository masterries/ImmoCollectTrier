import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const PriceAnalytics = ({ data, title = "Price Analysis" }) => {
    // Calculate price statistics
    const prices = data?.map(d => d?.Preis_cleaned).filter(Boolean) || [];
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const medianPrice = prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0;
    const pricePerSqm = data?.map(d => d?.Preis_pro_qm).filter(Boolean) || [];
    const avgPricePerSqm = pricePerSqm.length > 0 ? pricePerSqm.reduce((a, b) => a + b, 0) / pricePerSqm.length : 0;
    // Create price distribution data
    const getPriceDistribution = () => {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const step = (max - min) / 10;
        const distribution = Array(10).fill(0).map((_, i) => ({
            range: `${(min + step * i).toFixed(0)}-${(min + step * (i + 1)).toFixed(0)}`,
            count: 0
        }));
        prices.forEach(price => {
            const index = Math.min(Math.floor((price - min) / step), 9);
            distribution[index].count++;
        });
        return distribution;
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: title }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Average Price" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: avgPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) })] }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Median Price" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: medianPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) })] }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Avg. Price per m\u00B2" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: avgPricePerSqm.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) })] })] }), _jsx("div", { className: "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: getPriceDistribution(), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "range", angle: -45, textAnchor: "end", height: 70 }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#3b82f6" })] }) }) })] })] }));
};
