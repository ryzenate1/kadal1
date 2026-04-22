'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  RefreshCw, 
  Search, 
  Edit2, 
  Trash2, 
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  admin_response?: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

export default function AdminSupportPage() {
  const [adminKey, setAdminKey] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem('kadal_admin_key') || '';
    setAdminKey(k);
    if (k) fetchTickets(k);
  }, []);

  const fetchTickets = async (key?: string) => {
    const k = key || adminKey;
    if (!k) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/support', { headers: { 'x-admin-key': k } });
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        if (selected?.id === ticketId) setSelected(updated);
        toast.success('Status updated');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveResponse = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/support/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ admin_response: response, status: 'in_progress' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === selected.id ? updated : t));
        setSelected(updated);
        toast.success('Response saved');
      }
    } catch {
      toast.error('Failed to save response');
    } finally {
      setSaving(false);
    }
  };

  const filtered = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const term = search.toLowerCase();
    return matchStatus && (!term || [t.ticket_number, t.user_name, t.subject].some(f => f?.toLowerCase().includes(term)));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Center</h1>
          <p className="text-slate-500 mt-1">Manage customer queries and support tickets.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <Input 
          value={adminKey} 
          onChange={e => setAdminKey(e.target.value)} 
          placeholder="Admin key" 
          className="max-w-xs rounded-xl bg-slate-50 border-slate-100" 
        />
        <Button 
          onClick={() => { localStorage.setItem('kadal_admin_key', adminKey); fetchTickets(); }}
          className="rounded-xl bg-slate-900 hover:bg-slate-800"
        >
          Verify & Load
        </Button>
        <Button variant="outline" onClick={() => fetchTickets()} className="rounded-xl border-slate-200 bg-white">
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            {loading ? <p className="text-sm text-slate-400 p-4">Syncing...</p> : filtered.map(ticket => (
              <button key={ticket.id} onClick={() => { setSelected(ticket); setResponse(ticket.admin_response || ''); }}
                className={`w-full text-left rounded-2xl border p-3 transition-all ${selected?.id === ticket.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-mono opacity-70">{ticket.ticket_number}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${selected?.id === ticket.id ? 'bg-white/20 text-white' : STATUS_COLORS[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">{ticket.subject}</p>
                <p className="text-xs opacity-70">{ticket.user_name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-lg">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">Select a ticket to view details</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selected.subject}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selected.ticket_number} • {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-2 gap-4">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</p><p className="font-bold text-slate-900">{selected.user_name}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p><p className="font-bold text-slate-900 capitalize">{selected.category}</p></div>
                <div className="col-span-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Message</p><p className="text-sm text-slate-700 mt-2 bg-white p-4 rounded-xl border border-slate-100">{selected.message}</p></div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status</p>
                <div className="flex gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                    <button key={s} onClick={() => handleUpdateStatus(selected.id, s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selected.status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Response</p>
                <textarea value={response} onChange={e => setResponse(e.target.value)}
                  rows={4}
                  placeholder="Draft your reply..."
                  className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none" />
                <Button onClick={handleSaveResponse} disabled={saving} className="bg-red-600 hover:bg-red-700 rounded-xl px-8 font-bold">
                  {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Response
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
