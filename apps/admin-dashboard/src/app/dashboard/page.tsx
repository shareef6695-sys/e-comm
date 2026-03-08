"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="salla-card flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

const SalesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const OrderIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
);

const ProductIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 12,
    orders: 5,
    revenue: 12500,
    visitors: 342
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, here's what's happening with your store today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href="/dashboard/products/new" className="btn-primary flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span>Add Product</span>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`SAR ${stats.revenue.toLocaleString()}`} 
          icon={SalesIcon} 
          colorClass="bg-green-500 text-green-600" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={OrderIcon} 
          colorClass="bg-blue-500 text-blue-600" 
        />
        <StatCard 
          title="Products" 
          value={stats.products} 
          icon={ProductIcon} 
          colorClass="bg-purple-500 text-purple-600" 
        />
        <StatCard 
          title="Visitors" 
          value={stats.visitors} 
          icon={UserIcon} 
          colorClass="bg-orange-500 text-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section (Placeholder) */}
        <div className="lg:col-span-2 salla-card min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Sales Analytics</h3>
            <select className="border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Chart Visualization Placeholder</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="salla-card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-500"></div>
                <div>
                  <p className="text-sm text-gray-800">New order #100{i+1} received</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 btn-secondary text-sm">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
