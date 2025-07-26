"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, PlusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Use admin local API instead of direct server calls
const ADMIN_API_URL = '/api';

interface TrustedBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const defaultForm: Omit<TrustedBadge, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  description: '',
  iconName: '',
  order: 0,
  isActive: true,
};

export function TrustedBadgeManager() {
  const [badges, setBadges] = useState<TrustedBadge[]>([]);
  const [form, setForm] = useState<Omit<TrustedBadge, 'id' | 'createdAt' | 'updatedAt'>>({ ...defaultForm });
  const [editingBadge, setEditingBadge] = useState<TrustedBadge | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();  const fetchBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ADMIN_API_URL}/trusted-badges`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `Failed to fetch badges: ${res.statusText}`}));
        throw new Error(errData.message);
      }
      const data: TrustedBadge[] = await res.json();
      setBadges(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast({ title: "Error Loading Badges", description: err.message, variant: "destructive" });
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSwitchChange(name: string, checked: boolean) {
    setForm(f => ({ ...f, [name]: checked }));
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: parseInt(value, 10) || 0 }));
  }

  const resetFormAndState = () => {
    const nextOrder = badges.length > 0 ? Math.max(...badges.map(b => b.order || 0)) + 1 : 1;
    setForm({ ...defaultForm, order: nextOrder });
    setEditingBadge(null);
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || !form.description || !form.iconName) {
      setError("Title, description, and icon name are required.");
      return;
    }
    setFormLoading(true);
    setError(null);

    const payload: Omit<TrustedBadge, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } = {
      title: form.title,
      description: form.description,
      iconName: form.iconName,
      order: form.order,
      isActive: form.isActive,
    };
      let url = `${ADMIN_API_URL}/trusted-badges`;
    let method = 'POST';

    if (editingBadge) {
      payload.id = editingBadge.id;
      url = `${ADMIN_API_URL}/trusted-badges/${editingBadge.id}`;
      method = 'PUT';
    } else {
      if (form.order === undefined || form.order === 0) {
        payload.order = badges.length > 0 ? Math.max(...badges.map(b => b.order || 0)) + 1 : 1;
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Request failed with status ${res.status}` }));
        throw new Error(errorData.message || `Failed to ${editingBadge ? 'update' : 'add'} badge`);
      }
      
      const savedBadge = await res.json();
      toast({
        title: `Badge ${editingBadge ? 'Updated' : 'Created'}`,
        description: `"${savedBadge.title}" has been successfully saved.`,
      });
      resetFormAndState();
      await fetchBadges();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  }

  function handleEdit(badge: TrustedBadge) {
    setEditingBadge(badge);
    setForm({
      title: badge.title,
      description: badge.description,
      iconName: badge.iconName,
      order: badge.order === undefined ? 0 : badge.order,
      isActive: badge.isActive === undefined ? true : badge.isActive,
    });
    setError(null);
  }

  async function handleDelete(badgeId: string) {
    if (!confirm("Are you sure you want to delete this badge?")) return;
    setFormLoading(true);
    setError(null);
    try {      const res = await fetch(`${ADMIN_API_URL}/trusted-badges/${badgeId}`, { 
        method: 'DELETE', 
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `Failed to delete badge: ${res.statusText}`}));
        throw new Error(errData.message);
      }
      toast({ title: "Badge Deleted", description: "The badge has been successfully deleted." });
      await fetchBadges();
      if (editingBadge && editingBadge.id === badgeId) {
        resetFormAndState();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800">Trusted Badges Manager</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g., FSSAI Certified" required 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <Label htmlFor="iconName" className="block text-sm font-medium text-gray-700 mb-1">Icon Name (Lucide)</Label>
              <Input id="iconName" name="iconName" value={form.iconName} onChange={handleChange} placeholder="e.g., ShieldCheck" required 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              <p className="text-xs text-gray-500 mt-1">E.g., ShieldCheck, Clock, Tag. See Lucide React docs.</p>
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="e.g., Verified Food Safety" required 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Display Order</Label>
              <Input id="order" name="order" type="number" value={form.order} onChange={handleNumberChange} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex items-center space-x-2 pt-5">
              <Switch id="isActive" name="isActive" checked={form.isActive} onCheckedChange={(checked) => handleSwitchChange('isActive', checked)} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-2">
            {editingBadge && (
              <Button type="button" variant="outline" onClick={() => { resetFormAndState(); }} disabled={formLoading}>
                Cancel Update
              </Button>
            )}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" disabled={formLoading}>
              {formLoading ? <span className="animate-spin">⚙️</span> : (editingBadge ? 'Update Badge' : 'Add New Badge')}
            </Button>
          </div>
        </form>

        <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-8 border-t pt-4">Current Badges</h3>
        {loading && badges.length === 0 && <p className="text-center text-gray-500 py-3">Loading badges...</p>}
        {!loading && badges.length === 0 && !error && <p className="text-center text-gray-500 py-3">No trusted badges found. Add one using the form above.</p>}
        
        {badges.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600 px-4 py-2">Icon</TableHead>
                  <TableHead className="font-semibold text-gray-600 px-4 py-2">Title</TableHead>
                  <TableHead className="font-semibold text-gray-600 px-4 py-2">Description</TableHead>
                  <TableHead className="font-semibold text-gray-600 px-4 py-2 text-center">Order</TableHead>
                  <TableHead className="font-semibold text-gray-600 px-4 py-2 text-center">Status</TableHead>
                  <TableHead className="font-semibold text-gray-600 px-4 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges.map((badge) => (
                  <TableRow key={badge.id} className="hover:bg-gray-100 border-b">
                    <TableCell className="px-4 py-3">
                       <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded-md text-gray-700">{badge.iconName}</span>
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 px-4 py-3">{badge.title}</TableCell>
                    <TableCell className="text-gray-600 text-sm px-4 py-3">{badge.description}</TableCell>
                    <TableCell className="text-gray-600 text-sm px-4 py-3 text-center">{badge.order}</TableCell>
                    <TableCell className="text-gray-600 text-sm px-4 py-3 text-center">
                      {badge.isActive ? 
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span> : 
                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Inactive</span>}
                    </TableCell>
                    <TableCell className="text-right px-4 py-3">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(badge)} className="mr-1 h-8 w-8 text-blue-600 hover:text-blue-800">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(badge.id)} className="h-8 w-8 text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 