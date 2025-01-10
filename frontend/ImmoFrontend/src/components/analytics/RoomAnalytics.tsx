// src/components/analytics/RoomAnalytics.tsx
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

interface RoomAnalyticsProps {
  data: PropertyData[];
  title?: string;
}

export const RoomAnalytics: React.FC<RoomAnalyticsProps> = ({ 
  data, 
  title = "Room Analysis" 
}) => {
  // Room statistics
  const roomCounts = data
    .map(d => d.Zimmer)
    .filter(Boolean)
    .reduce((acc, rooms) => {
      acc[rooms] = (acc[rooms] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

  const roomDistribution = Object.entries(roomCounts)
    .map(([rooms, count]) => ({
      rooms: `${rooms} Rooms`,
      count
    }))
    .sort((a, b) => Number(a.rooms.split(' ')[0]) - Number(b.rooms.split(' ')[0]));

  const avgRooms = data.reduce((acc, d) => acc + (d.Zimmer || 0), 0) / data.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">Average Rooms</div>
          <div className="text-2xl font-bold text-gray-900">
            {avgRooms.toFixed(1)}
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rooms" />
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