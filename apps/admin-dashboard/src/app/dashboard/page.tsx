"use client";

import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats (mock for now or real API)
    const fetchStats = async () => {
      try {
        // const productsRes = await api.get('/catalog/products');
        // const ordersRes = await api.get('/orders');
        // setStats({ products: productsRes.data.length, orders: ordersRes.data.length, revenue: 12000 });
        setStats({ products: 12, orders: 5, revenue: 1250 });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Total Products</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.products}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.orders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm uppercase font-bold">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">${stats.revenue}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity found.</p>
      </div>
    </div>
  );
}
