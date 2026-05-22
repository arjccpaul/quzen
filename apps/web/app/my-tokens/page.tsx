'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function MyTokensPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    api.get('/queue/my-tokens').then((r) => {
      setTokens(r.data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Active Tokens</h1>

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {!loading && tokens.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🎫</p>
            <p className="mb-4">No active tokens.</p>
            <Link href="/businesses" className="text-indigo-600 hover:underline text-sm">
              Browse queues
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {tokens.map((t) => (
            <Link
              key={t.id}
              href={`/token/${t.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-300 transition flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{t.session?.business?.name}</p>
                <p className="text-sm text-gray-500">{t.category?.name}</p>
                <p className="text-xs text-gray-400 mt-1">~{t.estimatedWaitMin} min wait</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">#{t.tokenNumber}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{t.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
