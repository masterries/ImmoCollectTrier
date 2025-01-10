// src/components/analytics/LivingSpaceAnalytics.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProcessedPropertyData } from '../../utils/dataUtils';
import { getDataStatistics } from '../../utils/dataUtils';

interface LivingSpaceAnalyticsProps {
  data: ProcessedPropertyData[];
  title?: string;
}

export const LivingSpaceAnalytics: React.FC<LivingSpaceAnalyticsProps> = ({ 
  data, 
  title = "Living Space Analysis" 
}) => {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getDataStatistics(data);

  const getSpaceDistribution = () => {
    if (data.length === 0) return [];
    
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Average Living Space</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.livingSpace.avg.toFixed(1)} m²
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Median Living Space</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.livingSpace.median.toFixed(1)} m²
            </div>
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getSpaceDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};