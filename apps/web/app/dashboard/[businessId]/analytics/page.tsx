'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { BusinessSubnav } from '@/components/business-subnav';
import api from '@/lib/api';

export default function AnalyticsPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get(`/businesses/${businessId}`).then((r) => setBusiness(r.data));
    api.get(`/queue/status/${businessId}`).then((r) => setStats(r.data));
  }, [businessId]);

  // Derive category-level stats from active tokens
  const categoryBreakdown = (() => {
    if (!stats?.tokens || !business?.categories) return [];
    return business.categories.map((c: any) => {
      const tokens = stats.tokens.filter((t: any) => t.categoryName === c.name);
      return { name: c.name, count: tokens.length, avgWait: c.avgDurationMinutes };
    });
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <BusinessSubnav businessId={businessId} businessName={business?.name} />
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
            <p className="text-sm text-gray-500">{business?.name}</p>
          </div>
          <Link href={`/dashboard/${businessId}/queue`} className="text-sm text-indigo-600 hover:underline">
            ← Live Queue
          </Link>
        </div>

        {/* Today snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats?.totalWaiting ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Currently Waiting</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-gray-700">{business?.categories?.length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active Services</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center col-span-2 md:col-span-1">
            <p className="text-3xl font-bold text-green-600">
              {business?.categories?.length
                ? Math.round(
                    business.categories.reduce((a: number, c: any) => a + c.avgDurationMinutes, 0) /
                      business.categories.length,
                  )
                : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg Duration (min)</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Category Breakdown (Today)</h2>
          </div>
          {categoryBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm p-5">No data yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {categoryBreakdown.map((c: any) => (
                <div key={c.name} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Avg {c.avgWait} min/person (auto-learning)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{c.count}</p>
                    <p className="text-xs text-gray-400">in queue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Intelligence info */}
        <div className="bg-indigo-50 rounded-2xl p-5">
          <h3 className="font-semibold text-indigo-700 mb-2">Intelligence Engine</h3>
          <p className="text-sm text-indigo-600">
            Average durations update automatically as users confirm service completions.
            The more users confirm, the more accurate the predictions become.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {business?.categories?.map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500 truncate">{c.name}</p>
                <p className="text-base font-bold text-indigo-600 mt-0.5">{c.avgDurationMinutes} min</p>
                <p className="text-xs text-gray-400">current avg</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
