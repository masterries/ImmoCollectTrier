// src/components/analytics/AnalyticsContainer.tsx
import React from 'react';
import { PriceAnalytics, RoomAnalytics, LivingSpaceAnalytics } from './';
import type { PropertyData } from '../../types';

interface DataSet {
  data: PropertyData[];
  title: string;
}

interface AnalyticsContainerProps {
  datasets: DataSet[];
  className?: string;
}

const AnalyticsContainer: React.FC<AnalyticsContainerProps> = ({ datasets, className = "" }) => {
  const isComparison = datasets.length > 1;
  
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Price Analytics */}
      <div className={`grid gap-6 ${isComparison ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {datasets.map((dataset, index) => (
          <PriceAnalytics 
            key={`price-${index}`}
            data={dataset.data}
            title={`${dataset.title} - Price Analysis`}
          />
        ))}
      </div>

      {/* Room Analytics */}
      <div className={`grid gap-6 ${isComparison ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {datasets.map((dataset, index) => (
          <RoomAnalytics
            key={`rooms-${index}`}
            data={dataset.data}
            title={`${dataset.title} - Room Analysis`}
          />
        ))}
      </div>

      {/* Living Space Analytics */}
      <div className={`grid gap-6 ${isComparison ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {datasets.map((dataset, index) => (
          <LivingSpaceAnalytics
            key={`space-${index}`}
            data={dataset.data}
            title={`${dataset.title} - Living Space Analysis`}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalyticsContainer;