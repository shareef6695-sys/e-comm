"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    stockQuantity: '',
    tags: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        basePrice: initialData.basePrice || '',
        categoryId: initialData.categoryId || '',
        stockQuantity: initialData.stockQuantity || '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
      });
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/catalog/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };

      if (isEdit && initialData?.id) {
        await api.put(`/catalog/products/${initialData.id}`, payload);
      } else {
        await api.post('/catalog/products', payload);
      }
      
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="salla-card space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'Product Information'}
        </h3>
        <p className="text-sm text-gray-500">Fill in the details about your product</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border"
              placeholder="e.g. Summer T-Shirt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (SAR)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">SAR</span>
              </div>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-gray-200 pl-12 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border"
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="summer, sale, new"
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border"
            />
            <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 px-3 border"
          placeholder="Product description..."
        />
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}
