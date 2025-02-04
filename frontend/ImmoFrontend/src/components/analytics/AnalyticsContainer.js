import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PriceAnalytics, RoomAnalytics, LivingSpaceAnalytics } from './';
const AnalyticsContainer = ({ datasets, className = "" }) => {
    const isComparison = datasets.length > 1;
    return (_jsxs("div", { className: `space-y-8 ${className}`, children: [_jsx("div", { className: `grid gap-6 ${isComparison ? 'grid-cols-2' : 'grid-cols-1'}`, children: datasets.map((dataset, index) => (_jsx(PriceAnalytics, { data: dataset.data, title: `${dataset.title} - Price Analysis` }, `price-${index}`))) }), _jsx("div", { className: `grid gap-6 ${isComparison ? 'grid-cols-2' : 'grid-cols-1'}`, children: datasets.map((dataset, index) => (_jsx(RoomAnalytics, { data: dataset.data, title: `${dataset.title} - Room Analysis` }, `rooms-${index}`))) }), _jsx("div", { className: `grid gap-6 ${isComparison ? 'grid-cols-2' : 'grid-cols-1'}`, children: datasets.map((dataset, index) => (_jsx(LivingSpaceAnalytics, { data: dataset.data, title: `${dataset.title} - Living Space Analysis` }, `space-${index}`))) })] }));
};
export default AnalyticsContainer;
