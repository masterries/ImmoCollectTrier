// src/components/ImageGallery.tsx
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  images: string[];
  previewImage?: string;
}

const ImageGallery: React.FC<Props> = ({ images, previewImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div
        className="cursor-pointer relative group"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={previewImage || images[0]}
          alt="Property preview"
          className="w-full h-48 object-cover rounded-lg"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            +{images.length - 1} more
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative max-w-4xl mx-auto">
            <img
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ImageGallery;
