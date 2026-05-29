'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { BusinessSubnav } from '@/components/business-subnav';
import api from '@/lib/api';

export default function CategoriesPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [form, setForm] = useState({ name: '', avgDurationMinutes: 15 });
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = () => api.get(`/businesses/${businessId}`).then((r) => setBusiness(r.data));

  useEffect(() => { load(); }, [businessId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/businesses/${businessId}/categories`, form);
      setForm({ name: '', avgDurationMinutes: 15 });
      setShowAdd(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (categoryId: string) => {
    setToggling(categoryId);
    try {
      await api.patch(`/businesses/categories/${categoryId}/toggle`);
      load();
    } finally {
      setToggling(null);
    }
  };

  // All categories including inactive
  const allCategories = business?.categories ?? [];
  const active   = allCategories.filter((c: any) =>  c.isActive);
  const inactive = allCategories.filter((c: any) => !c.isActive);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <BusinessSubnav businessId={businessId} businessName={business?.name} />

      <div className="max-w-5xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Service Categories</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {active.length} active · {inactive.length} inactive — toggle to enable or disable
            </p>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            {showAdd ? '✕ Cancel' : '+ Add Custom Service'}
          </button>
        </div>

        {/* Add custom service form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 mb-6">
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleAdd} className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">Service Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. VIP Health Package"
                />
              </div>
              <div className="w-36">
                <label className="text-xs font-medium text-gray-600 block mb-1">Avg Duration (min)</label>
                <input
                  type="number" min={1} max={240} required
                  value={form.avgDurationMinutes}
                  onChange={(e) => setForm({ ...form, avgDurationMinutes: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <button
                type="submit" disabled={submitting}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </form>
          </div>
        )}

        {/* Active categories */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-4">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">Active Services</p>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{active.length} enabled</span>
          </div>
          {active.length === 0 && (
            <p className="text-sm text-gray-400 px-5 py-4">No active services. Toggle services below to enable them.</p>
          )}
          <div className="divide-y divide-gray-50">
            {active.map((c: any) => (
              <CategoryRow key={c.id} category={c} onToggle={handleToggle} toggling={toggling} />
            ))}
          </div>
        </div>

        {/* Inactive categories */}
        {inactive.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <p className="font-semibold text-gray-500 text-sm">Inactive Services</p>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{inactive.length} disabled</span>
            </div>
            <div className="divide-y divide-gray-50 opacity-60">
              {inactive.map((c: any) => (
                <CategoryRow key={c.id} category={c} onToggle={handleToggle} toggling={toggling} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function CategoryRow({ category: c, onToggle, toggling }: {
  category: any;
  onToggle: (id: string) => void;
  toggling: string | null;
}) {
  const isToggling = toggling === c.id;
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-sm font-medium text-gray-800">{c.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Avg {c.avgDurationMinutes} min per person</p>
      </div>
      <button
        onClick={() => onToggle(c.id)}
        disabled={isToggling}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          c.isActive ? 'bg-indigo-600' : 'bg-gray-200'
        } ${isToggling ? 'opacity-50' : ''}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          c.isActive ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
