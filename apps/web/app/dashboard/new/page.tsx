'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import api from '@/lib/api';
import { SECTOR_META } from '@/lib/sector-categories';

const SECTORS = Object.entries(SECTOR_META).map(([value, meta]) => ({ value, ...meta }));

export default function NewBusinessPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', sector: '', address: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sector) return;
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/businesses', form);
      // All categories are auto-created by the backend — go straight to live queue
      router.push(`/dashboard/${data.id}/queue`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create business');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Register Your Business</h1>
        <p className="text-gray-500 text-sm mb-8">
          All standard service categories for your sector will be added automatically.
        </p>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Business Name */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-sm font-medium text-gray-700 block mb-2">Business Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Apollo Diagnostic Centre"
            />
          </div>

          {/* Sector selection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-sm font-medium text-gray-700 block mb-3">Select Your Sector</label>
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm({ ...form, sector: s.value })}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                    form.sector === s.value
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
            {form.sector && (
              <p className="text-xs text-indigo-600 mt-3 font-medium">
                ✓ All standard services for <strong>{SECTOR_META[form.sector]?.label}</strong> will be auto-added
              </p>
            )}
          </div>

          {/* Address + City */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Address</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Street / Area"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. Kolkata"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.sector}
            className="bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
          >
            {submitting ? 'Creating & adding services...' : 'Register Business →'}
          </button>
        </form>
      </div>
    </div>
  );
}
