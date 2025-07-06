import React, { useEffect, useState } from 'react';

export default function ClientCards() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product._id} className="bg-white rounded shadow p-4 flex flex-col">
          <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover rounded mb-2" />
          <h3 className="font-bold text-lg mb-1">{product.name}</h3>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-blue-700 font-bold text-xl">₹{product.price}</span>
            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Stock: {product.stock}</span>
          </div>
        </div>
      ))}
    </div>
  );
} 