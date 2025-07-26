"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2, Search, Edit, PackageSearch, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ApiStatus } from '@/components/dashboard/api-status';

const SERVER_API_URL = 'http://localhost:5001/api';
const LOW_STOCK_THRESHOLD = 10;

interface Product {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  stock?: number;
  // Add categoryId if you want to display or filter by category
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // For filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for low to high, 'desc' for high to low
  const [stockFilter, setStockFilter] = useState(''); // 'all', 'low', 'out'
  const fetchProductsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products`), // Remove fields parameter as it's not supported
        fetch(`/api/categories`)
      ]);

      if (!productsRes.ok) {
        const errData = await productsRes.json().catch(() => ({ message: `Error fetching products: ${productsRes.statusText}` }));
        throw new Error(errData.message);
      }
      const productsData: Product[] = await productsRes.json();
      setProducts(productsData);

      if (categoriesRes.ok) {
        const categoriesData: Category[] = await categoriesRes.json();
        setCategories(categoriesData);
      } else {
        console.warn("Could not fetch categories for filtering.");
        // Not a fatal error for this page, but good to note
      }

    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error Fetching Data", description: err.message, variant: "destructive" });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  const filteredAndSortedProducts = products
    .filter(product => {
      const searchLower = searchTerm.toLowerCase();
      return product.name.toLowerCase().includes(searchLower) || product.slug.toLowerCase().includes(searchLower);
    })
    .filter(product => {
      if (stockFilter === 'low') return (product.stock ?? 0) > 0 && (product.stock ?? 0) <= LOW_STOCK_THRESHOLD;
      if (stockFilter === 'out') return (product.stock ?? 0) === 0;
      return true; // 'all' or no filter
    })
    .sort((a, b) => {
      const stockA = a.stock ?? 0;
      const stockB = b.stock ?? 0;
      return sortOrder === 'asc' ? stockA - stockB : stockB - stockA;
    });

  if (loading && products.length === 0 && !error) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">      <DashboardHeader
        title="Inventory Management"
        description="View product stock levels and manage inventory."
        actions={
          <div className="flex items-center">
            <PackageSearch className="h-6 w-6 mr-2" />
          </div>
        }
      />{/* API Connection Status */}
      <ApiStatus endpoint="products" onRefresh={fetchProductsAndCategories} />

      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b mb-4 items-end">
            <div className="sm:col-span-1">
              <label htmlFor="search-inventory" className="text-sm font-medium text-gray-700 block mb-1">Search Products</label>              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-inventory"
                  type="search"
                  placeholder="Search by Name or Slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label htmlFor="stock-filter" className="text-sm font-medium text-gray-700 block mb-1">Filter by Stock</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger id="stock-filter"><SelectValue placeholder="All Stock Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock (1-{LOW_STOCK_THRESHOLD})</SelectItem>
                  <SelectItem value="out">Out of Stock (0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 block mb-1">Sort by Stock</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sort-order"><SelectValue placeholder="Sort Order" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Stock: Low to High</SelectItem>
                  <SelectItem value="desc">Stock: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
             <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Error loading inventory: {error}. Ensure products API supports `fields` query param.</span>
            </div>
          )}

          {filteredAndSortedProducts.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500 py-8">No products found matching your criteria.</p>
          )}

          {filteredAndSortedProducts.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.map((product) => (
                    <TableRow key={product.id} className={product.stock === 0 ? 'bg-red-50' : (product.stock && product.stock <= LOW_STOCK_THRESHOLD ? 'bg-yellow-50' : '')}>
                      <TableCell>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No img</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.slug}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{product.stock ?? 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        {(product.stock ?? -1) === 0 && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Out of Stock</span>}
                        {(product.stock ?? -1) > 0 && (product.stock ?? Infinity) <= LOW_STOCK_THRESHOLD && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Low Stock</span>}
                        {(product.stock ?? -1) > LOW_STOCK_THRESHOLD && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">In Stock</span>}
                        {product.stock === undefined && <span className="text-xs text-gray-500">Unknown</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/products?edit=${product.id}&returnTo=/dashboard/inventory`}>
                            <Edit size={14} className="mr-1" /> Manage Stock
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 