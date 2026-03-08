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

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
