import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/ImageGallery.tsx
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
const ImageGallery = ({ images, previewImage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "cursor-pointer relative group", onClick: () => setIsOpen(true), children: [_jsx("img", { src: previewImage || images[0], alt: "Property preview", className: "w-full h-48 object-cover rounded-lg" }), images.length > 1 && (_jsxs("div", { className: "absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm", children: ["+", images.length - 1, " more"] }))] }), _jsx(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: _jsxs("div", { className: "fixed inset-0 bg-black/90 z-50 flex items-center justify-center", children: [_jsx(Button, { variant: "ghost", className: "absolute top-4 right-4 text-white", onClick: () => setIsOpen(false), children: _jsx(X, { className: "w-6 h-6" }) }), _jsxs("div", { className: "relative max-w-4xl mx-auto", children: [_jsx("img", { src: images[currentIndex], alt: `Property image ${currentIndex + 1}`, className: "max-h-[80vh] max-w-full object-contain" }), images.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", className: "absolute left-4 top-1/2 -translate-y-1/2 text-white", onClick: handlePrevious, children: _jsx(ChevronLeft, { className: "w-8 h-8" }) }), _jsx(Button, { variant: "ghost", className: "absolute right-4 top-1/2 -translate-y-1/2 text-white", onClick: handleNext, children: _jsx(ChevronRight, { className: "w-8 h-8" }) })] })), _jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-white", children: [currentIndex + 1, " / ", images.length] })] })] }) })] }));
};
export default ImageGallery;
