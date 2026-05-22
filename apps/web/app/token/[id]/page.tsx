'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';

export default function TokenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<any>(null);
  const [signalSent, setSignalSent] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchToken = async () => {
    try {
      const { data } = await api.get(`/queue/token/${id}`);
      setToken(data);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
    const socket = connectSocket();

    socket.emit('watch-token', id);
    socket.on('queue-updated', () => fetchToken());

    return () => {
      socket.off('queue-updated');
      disconnectSocket();
    };
  }, [id]);

  const cancelToken = async () => {
    setCancelling(true);
    try {
      await api.delete(`/queue/token/${id}/cancel`);
      router.push('/my-tokens');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to cancel token');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const sendSignal = async (signalType: 'ARRIVED' | 'COMPLETED') => {
    try {
      await api.post('/queue/signal', { tokenId: id, signalType });
      setSignalSent(signalType);
      fetchToken();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error sending signal');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading token...</div>
    </div>
  );

  if (!token) return null;

  const statusColors: Record<string, string> = {
    WAITING: 'bg-yellow-100 text-yellow-700',
    ARRIVED: 'bg-blue-100 text-blue-700',
    IN_SERVICE: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    SKIPPED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-md mx-auto w-full px-4 py-10">

        {/* Token Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">
            {token.session?.business?.name}
          </p>
          <p className="text-sm text-gray-400 mb-4">{token.category?.name}</p>

          <div className="text-7xl font-bold text-indigo-600 mb-2">
            #{token.tokenNumber}
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[token.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {token.status.replace('_', ' ')}
          </span>
        </div>

        {/* ETA & Position */}
        {['WAITING', 'ARRIVED'].includes(token.status) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-gray-800">{token.aheadCount}</p>
              <p className="text-xs text-gray-500 mt-1">people ahead</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-indigo-600">
                ~{token.estimatedWaitMin}
              </p>
              <p className="text-xs text-gray-500 mt-1">min estimated</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {token.status === 'WAITING' && !signalSent && (
          <button
            onClick={() => sendSignal('ARRIVED')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition mb-3"
          >
            I Have Arrived
          </button>
        )}

        {['WAITING', 'ARRIVED', 'IN_SERVICE'].includes(token.status) && signalSent !== 'COMPLETED' && (
          <button
            onClick={() => sendSignal('COMPLETED')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
          >
            Service Completed — Help Others
          </button>
        )}

        {token.status === 'COMPLETED' && (
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-semibold text-green-700">Done! Thank you.</p>
            <p className="text-sm text-green-600 mt-1">
              Your feedback helped improve wait predictions for everyone.
            </p>
          </div>
        )}

        {/* Cancel Token */}
        {['WAITING', 'ARRIVED', 'IN_SERVICE'].includes(token.status) && (
          <div className="mt-4">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition"
              >
                Cancel Token
              </button>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-red-700 mb-1">Cancel this token?</p>
                <p className="text-xs text-red-500 mb-4">You will lose your position in the queue.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Keep My Spot
                  </button>
                  <button
                    onClick={cancelToken}
                    disabled={cancelling}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Community nudge */}
        {['WAITING', 'ARRIVED'].includes(token.status) && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Tap &quot;Service Completed&quot; when done — you help the next person know the wait.
          </p>
        )}
      </div>
    </div>
  );
}
