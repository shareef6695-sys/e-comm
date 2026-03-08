"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white w-64 flex-shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-64'
        } fixed inset-y-0 left-0 z-20 md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            X
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/dashboard" className="block p-2 hover:bg-gray-700 rounded">
            Dashboard
          </a>
          <a href="/dashboard/products" className="block p-2 hover:bg-gray-700 rounded">
            Products
          </a>
          <a href="/dashboard/orders" className="block p-2 hover:bg-gray-700 rounded">
            Orders
          </a>
          <a href="/dashboard/settings" className="block p-2 hover:bg-gray-700 rounded">
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-200"
          >
            Menu
          </button>
          <div className="font-semibold text-gray-700">Merchant Dashboard</div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
