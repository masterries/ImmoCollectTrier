import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFilters } from '../contexts/FilterContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function DateRangeFilter() {
    const { filters, setFilters } = useFilters();
    const handleDateChange = (type) => (e) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [type]: e.target.value || null
            }
        }));
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { htmlFor: "startDate", className: "text-sm text-gray-600", children: "From Date" }), _jsx(Input, { id: "startDate", type: "date", value: filters.dateRange.start || '', onChange: handleDateChange('start'), className: "w-full" })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { htmlFor: "endDate", className: "text-sm text-gray-600", children: "To Date" }), _jsx(Input, { id: "endDate", type: "date", value: filters.dateRange.end || '', onChange: handleDateChange('end'), className: "w-full" })] })] }));
}
