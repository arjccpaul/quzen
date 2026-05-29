'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/businesses/${id}`),
      api.get(`/queue/status/${id}`),
    ]).then(([b, q]) => {
      setBusiness(b.data);
      setQueueStatus(q.data);
    });
  }, [id]);

  const handleJoin = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!selectedCategory) { setError('Please select a service'); return; }
    setJoining(true);
    setError('');
    try {
      const { data } = await api.post('/queue/join', {
        businessId: id,
        categoryId: selectedCategory,
      });
      router.push(`/token/${data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to join queue');
    } finally {
      setJoining(false);
    }
  };

  if (!business) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-10">

        {/* Business Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{business.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{business.address}, {business.city}</p>
          <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {business.sector.replace('_', ' ')}
          </span>
        </div>

        {/* Live Queue Status */}
        {queueStatus && (
          <div className="bg-indigo-50 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="text-3xl font-bold text-indigo-600">{queueStatus.totalWaiting}</div>
            <div>
              <p className="font-medium text-indigo-700">people currently waiting</p>
              <p className="text-xs text-indigo-500 mt-0.5">Live queue status</p>
            </div>
          </div>
        )}

        {/* Select Service */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Select a Service</h2>
          <div className="grid gap-3 mb-5">
            {business.categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-left px-4 py-3 rounded-xl border transition ${
                  selectedCategory === c.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Avg wait: ~{c.avgDurationMinutes} min per person
                </p>
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join Queue'}
          </button>
          {!user && (
            <p className="text-center text-xs text-gray-400 mt-3">
              You will be asked to log in before joining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
