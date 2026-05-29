'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { BusinessSubnav } from '@/components/business-subnav';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ARRIVED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_SERVICE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  SKIPPED: 'bg-gray-100 text-gray-400 border-gray-200',
};

export default function LiveQueuePage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    const [b, q] = await Promise.all([
      api.get(`/businesses/${businessId}`),
      api.get(`/queue/status/${businessId}`),
    ]);
    setBusiness(b.data);
    setQueueStatus(q.data);
    setLastUpdated(new Date());
  }, [businessId]);

  useEffect(() => {
    fetchStatus();
    const socket = connectSocket();
    socket.emit('watch-queue', businessId);
    socket.on('queue-updated', fetchStatus);

    // Poll every 30s as fallback
    const interval = setInterval(fetchStatus, 30000);

    return () => {
      socket.off('queue-updated', fetchStatus);
      clearInterval(interval);
      disconnectSocket();
    };
  }, [businessId, fetchStatus]);

  const getQueueLabel = (count: number) => {
    if (count === 0) return { label: 'Queue Clear', color: 'text-green-600', bg: 'bg-green-50' };
    if (count <= 5) return { label: 'Moving Normally', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (count <= 15) return { label: 'Slight Delay', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'High Rush', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const queueLabel = getQueueLabel(queueStatus?.totalWaiting ?? 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <BusinessSubnav businessId={businessId} businessName={business?.name} />
      <div className="max-w-5xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{business?.name ?? 'Loading...'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Live Queue Monitor · Updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/${businessId}/analytics`}
              className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:border-indigo-300 transition"
            >
              Analytics
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-indigo-600 hover:underline flex items-center"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-4xl font-bold text-indigo-600">{queueStatus?.totalWaiting ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Waiting</p>
          </div>
          <div className={`rounded-2xl border p-5 text-center ${queueLabel.bg}`}>
            <p className={`text-sm font-semibold ${queueLabel.color}`}>{queueLabel.label}</p>
            <p className="text-xs text-gray-500 mt-1">Queue Status</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-4xl font-bold text-gray-700">
              {business?.categories?.length ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Services</p>
          </div>
        </div>

        {/* Token List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Active Tokens</h2>
            <button
              onClick={fetchStatus}
              className="text-xs text-indigo-500 hover:underline"
            >
              Refresh
            </button>
          </div>

          {!queueStatus?.tokens?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-sm">Queue is empty right now</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {queueStatus.tokens.map((t: any, idx: number) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-300 w-8 text-right">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-indigo-600">#{t.tokenNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-400'}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{t.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">~{t.estimatedWaitMin} min</p>
                    <p className="text-xs text-gray-400">est. wait</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Queue updates automatically as users confirm arrival and completion.
        </p>
      </div>
    </div>
  );
}
