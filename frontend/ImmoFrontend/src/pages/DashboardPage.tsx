// src/pages/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PropertyFilters from '../components/PropertyFilters';
import HousingAnalytics from '../components/HousingAnalytics';
import { Button } from "@/components/ui/button";
import { ListFilter } from 'lucide-react';
import type { PropertyData, DataRanges } from '../types';

interface Props {
  data: PropertyData[];
  propertyTypes: string[];
  ranges: DataRanges;
}

const DashboardPage: React.FC<Props> = ({ data, propertyTypes, ranges }) => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Market Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview of the Trier real estate market
            </p>
          </div>
          <Link to="/list">
            <Button variant="outline" className="flex items-center gap-2">
              <ListFilter className="w-4 h-4" />
              View as List
            </Button>
          </Link>
        </div>

        <PropertyFilters propertyTypes={propertyTypes} ranges={ranges} />
        <HousingAnalytics data={data} />
      </div>
    </Layout>
  );
};

export default DashboardPage;