'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-yellow-100 text-yellow-700',
  ARRIVED: 'bg-blue-100 text-blue-700',
  IN_SERVICE: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role === 'BUSINESS_OWNER') { router.push('/dashboard'); return; }
    api.get('/queue/my-tokens').then((r) => {
      setActiveTokens(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-10 flex flex-col gap-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                Member
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/businesses"
            className="bg-indigo-600 text-white rounded-2xl p-5 flex flex-col gap-1 hover:bg-indigo-700 transition"
          >
            <span className="text-2xl">🔍</span>
            <span className="font-semibold text-sm mt-1">Find a Queue</span>
            <span className="text-xs text-indigo-200">Browse businesses near you</span>
          </Link>
          <Link
            href="/my-tokens"
            className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-1 hover:border-indigo-300 transition"
          >
            <span className="text-2xl">🎫</span>
            <span className="font-semibold text-sm text-gray-800 mt-1">My Tokens</span>
            <span className="text-xs text-gray-400">Track your active queue positions</span>
          </Link>
        </div>

        {/* Active Tokens */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Active Tokens</h2>
            <Link href="/my-tokens" className="text-xs text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          {loading && <p className="text-sm text-gray-400">Loading...</p>}

          {!loading && activeTokens.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🎫</p>
              <p className="text-sm">No active tokens right now.</p>
              <Link href="/businesses" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                Join a queue
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {activeTokens.map((t) => (
              <Link
                key={t.id}
                href={`/token/${t.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.session?.business?.name}</p>
                  <p className="text-xs text-gray-500">{t.category?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">~{t.estimatedWaitMin} min wait</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-2xl font-bold text-indigo-600">#{t.tokenNumber}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] ?? ''}`}>
                    {t.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
          <h2 className="font-bold text-gray-800 mb-1">Account</h2>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm text-gray-800 font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm text-gray-800">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Role</span>
            <span className="text-sm text-gray-800">Member</span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
          >
            Log out
          </button>
        </div>

      </div>
    </div>
  );
}
