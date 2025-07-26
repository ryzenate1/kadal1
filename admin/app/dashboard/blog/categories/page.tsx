'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BlogCategoriesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blog Categories</h1>
        <p className="text-gray-600 mt-1">Manage your blog categories</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Blog Categories</CardTitle>
          <CardDescription>Categories for organizing blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Blog categories management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}