'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'BUSINESS_OWNER') { router.push('/businesses'); return; }
    api.get('/businesses/my').then((r) => {
      setBusinesses(r.data);
      setLoading(false);
    });
  }, [user]);

  const handleLogout = () => { logout(); router.push('/'); };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-10 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Business Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your queues, categories and analytics</p>
          </div>
          <Link
            href="/dashboard/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            + New Business
          </Link>
        </div>

        {/* Owner profile strip */}
        <div className="bg-indigo-600 rounded-2xl p-5 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-indigo-200 text-sm">{user.email}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleLogout}
              className="text-indigo-200 hover:text-white text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {!loading && businesses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-5xl mb-4">🏢</p>
            <p className="text-gray-500 mb-4">You have no businesses yet.</p>
            <Link
              href="/dashboard/new"
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              Register your first business
            </Link>
          </div>
        )}

        {/* Business cards */}
        <div className="grid gap-5">
          {businesses.map((b) => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{b.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{b.address}, {b.city}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      {b.sector.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {b.categories?.length ?? 0} {b.categories?.length === 1 ? 'category' : 'categories'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-3 gap-3">
                <Link
                  href={`/dashboard/${b.id}/queue`}
                  className="flex flex-col items-center justify-center bg-indigo-600 text-white rounded-xl py-4 hover:bg-indigo-700 transition"
                >
                  <span className="text-xl mb-1">📋</span>
                  <span className="text-xs font-semibold">Live Queue</span>
                </Link>
                <Link
                  href={`/dashboard/${b.id}/categories`}
                  className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl py-4 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  <span className="text-xl mb-1">🗂️</span>
                  <span className="text-xs font-semibold text-gray-700">Categories</span>
                </Link>
                <Link
                  href={`/dashboard/${b.id}/analytics`}
                  className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl py-4 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  <span className="text-xl mb-1">📊</span>
                  <span className="text-xs font-semibold text-gray-700">Analytics</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
