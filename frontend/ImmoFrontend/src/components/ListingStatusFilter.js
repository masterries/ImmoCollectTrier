import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFilters } from '../contexts/FilterContext';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
export default function ListingStatusFilter() {
    const { filters, setFilters } = useFilters();
    const handleStatusChange = (status) => (checked) => {
        setFilters(prev => ({
            ...prev,
            listingStatus: {
                ...prev.listingStatus,
                [status]: checked
            }
        }));
    };
    return (_jsxs("div", { className: "flex gap-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "active-listings", checked: filters.listingStatus.active, onCheckedChange: (checked) => handleStatusChange('active')(!!checked) }), _jsx(Label, { htmlFor: "active-listings", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", children: "Active Listings" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "closed-listings", checked: filters.listingStatus.closed, onCheckedChange: (checked) => handleStatusChange('closed')(!!checked) }), _jsx(Label, { htmlFor: "closed-listings", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", children: "Closed Listings" })] })] }));
}
