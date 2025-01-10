// src/components/analytics/PriceAnalytics.tsx
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
import type { PropertyData } from '../../types';

interface PriceAnalyticsProps {
  data: PropertyData[];
  title?: string;
}

export const PriceAnalytics: React.FC<PriceAnalyticsProps> = ({ 
  data, 
  title = "Price Analysis" 
}) => {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Average Price</div>
            <div className="text-2xl font-bold text-gray-900">
              {avgPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Median Price</div>
            <div className="text-2xl font-bold text-gray-900">
              {medianPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Avg. Price per m²</div>
            <div className="text-2xl font-bold text-gray-900">
              {avgPricePerSqm.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getPriceDistribution()}>
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