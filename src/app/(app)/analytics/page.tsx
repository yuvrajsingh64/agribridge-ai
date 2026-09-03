"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { IndianRupee, PackageOpen, TrendingUp, Award } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 127500 },
  { month: 'Feb', revenue: 85000 },
  { month: 'Mar', revenue: 180000 },
  { month: 'Apr', revenue: 95000 },
  { month: 'May', revenue: 145000 },
  { month: 'Jun', revenue: 111000 },
];

const cropRevenueData = [
  { name: 'Wheat', revenue: 320000 },
  { name: 'Soybean', revenue: 215000 },
  { name: 'Rice', revenue: 145000 },
  { name: 'Chickpea', revenue: 63500 },
];

const buyerDistributionData = [
  { name: 'Shakti Foods', value: 45 },
  { name: 'Central Grain', value: 30 },
  { name: 'Malwa Foods', value: 15 },
  { name: 'Others', value: 10 },
];

const paymentStatusData = [
  { name: 'Status', Paid: 655000, Pending: 88500 }
];

const COLORS = ['#15803d', '#f59e0b', '#3b82f6', '#a855f7'];

export default function AnalyticsPage() {
  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: value > 99999 ? 'compact' : 'standard'
    }).format(value);
  };

  const formatTooltipCurrency = (value: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Farm Analytics</h1>
        <p className="text-muted-foreground">Demo transaction history and performance metrics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <IndianRupee className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹7,43,500</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" /> +14% from last year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity Sold</CardTitle>
            <PackageOpen className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">285 Qtl</div>
            <p className="text-xs text-muted-foreground mt-1">Across 4 crop varieties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Price / Quintal</CardTitle>
            <LineChart className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,608</div>
            <p className="text-xs text-muted-foreground mt-1">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Performing Crop</CardTitle>
            <Award className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Wheat</div>
            <p className="text-xs text-muted-foreground mt-1">43% of total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Over Time */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Demo transaction history for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={formatCurrency} 
                    axisLine={false} 
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatTooltipCurrency(value), 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#15803d" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#15803d' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Crop-wise Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Crop</CardTitle>
            <CardDescription>Demo transaction history breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={formatCurrency} 
                    axisLine={false} 
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: any) => [formatTooltipCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Distribution</CardTitle>
            <CardDescription>Demo transaction history volume by buyer (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buyerDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {buyerDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Paid vs Pending amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={paymentStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  stackOffset="expand"
                >
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      formatTooltipCurrency(value), 
                      name
                    ]}
                  />
                  <Bar dataKey="Paid" stackId="a" fill="#15803d" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="Pending" stackId="a" fill="#eab308" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
