import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const RoomAnalytics = ({ data, title = "Room Analysis" }) => {
    // Room statistics
    const roomCounts = data
        .map(d => d.Zimmer)
        .filter(Boolean)
        .reduce((acc, rooms) => {
        acc[rooms] = (acc[rooms] || 0) + 1;
        return acc;
    }, {});
    const roomDistribution = Object.entries(roomCounts)
        .map(([rooms, count]) => ({
        rooms: `${rooms} Rooms`,
        count
    }))
        .sort((a, b) => Number(a.rooms.split(' ')[0]) - Number(b.rooms.split(' ')[0]));
    const avgRooms = data.reduce((acc, d) => acc + (d.Zimmer || 0), 0) / data.length;
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: title }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-6 p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Average Rooms" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: avgRooms.toFixed(1) })] }), _jsx("div", { className: "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: roomDistribution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "rooms" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#3b82f6" })] }) }) })] })] }));
};
