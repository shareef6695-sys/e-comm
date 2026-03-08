"use client";

import ProductForm from '../../../../components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new product for your store</p>
      </div>
      <ProductForm />
    </div>
  );
}
