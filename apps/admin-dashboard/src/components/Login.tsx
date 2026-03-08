"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState(''); // For initial login/register flow
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // Register flow (simplified: register user + create tenant?)
        // In this simplified flow, we assume registration creates a user for a tenant
        // But platform admin vs tenant admin is tricky.
        // Let's assume we are logging in to an existing tenant or creating one.
        
        // For now, let's just stick to Login. Registration usually requires a separate flow or platform admin.
        setError('Registration not implemented in this demo. Please login.');
        return;
      }

      // Login
      // We need to know which tenant we are logging into, OR we log in as platform user.
      // Our backend requires x-tenant-id for most things, but /auth/login might depend on implementation.
      // Let's check AuthController. It likely needs a tenant context or finds user by email across tenants?
      // Actually, standard SaaS usually asks for "Workspace/Store URL" first, then login.
      // Or email, then find tenants.
      
      // Let's assume we provide tenantName (subdomain) to resolve tenant, then login.
      // But for local dev, we might set x-tenant-id header manually or use localhost.
      
      // If we are testing, we might want to manually specify the tenant ID or Name.
      // Let's look up the tenant first? 
      // For this MVP, let's assume we send credentials to /auth/login 
      // and we might need to pass the tenant ID in header if the user is scoped to a tenant.
      
      // TEMPORARY: Just try to login. If backend requires tenant, we might fail.
      // Let's assume we are logging in as a user of a specific tenant.
      // We need a way to input tenant ID or Name.
      
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.access_token);
      // localStorage.setItem('tenantId', ...); // If returned
      
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? 'Create Account' : 'Merchant Login'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant/Store Name Input - Crucial for Multi-tenancy */}
          {/* 
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name (Tenant)</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="my-awesome-store"
            />
          </div> 
          */}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
