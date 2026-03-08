"use client";

import { useEffect, useState } from 'react';
import ProductForm from '../../../../components/ProductForm';
import api from '../../../../lib/api';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/catalog/products/${params.id}`);
      // Transform response if necessary to match form structure
      // ProductForm expects: { name, description, basePrice, category: { id }, stockQuantity, tags: [] }
      // Backend returns product with relations.
      // But stockQuantity is in variants[0].stockQuantity
      const data = res.data;
      if (data.variants && data.variants.length > 0) {
        data.stockQuantity = data.variants[0].stockQuantity;
      }
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
        <p className="mt-1 text-gray-500">The product you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">Update product information</p>
      </div>
      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
