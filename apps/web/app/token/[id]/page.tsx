'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  WAITING:    { label: 'WAITING',     color: '#16a34a', bg: '#dcfce7', dot: '#16a34a' },
  ARRIVED:    { label: 'ARRIVED',     color: '#2563eb', bg: '#dbeafe', dot: '#2563eb' },
  IN_SERVICE: { label: 'IN SERVICE',  color: '#7c3aed', bg: '#ede9fe', dot: '#7c3aed' },
  COMPLETED:  { label: 'COMPLETED',   color: '#16a34a', bg: '#dcfce7', dot: '#16a34a' },
  CANCELLED:  { label: 'CANCELLED',   color: '#dc2626', bg: '#fee2e2', dot: '#dc2626' },
  SKIPPED:    { label: 'SKIPPED',     color: '#6b7280', bg: '#f3f4f6', dot: '#6b7280' },
};

const SECTOR_PREFIX: Record<string, string> = {
  DIAGNOSTIC:     'D',
  HOSPITAL:       'H',
  BANK:           'B',
  RESTAURANT:     'R',
  SALON:          'S',
  VEHICLE_SERVICE:'V',
};

export default function TokenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signalSent, setSignalSent] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchToken = async () => {
    try {
      const { data } = await api.get(`/queue/token/${id}`);
      setToken(data);
      setLastUpdated(new Date());
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #c7d2fe', borderTopColor: '#4f46e5', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading your token...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!token) return null;

  const status = STATUS_CONFIG[token.status] ?? STATUS_CONFIG.WAITING;
  const sector = token.session?.business?.sector ?? 'DIAGNOSTIC';
  const prefix = SECTOR_PREFIX[sector] ?? 'Q';
  const tokenLabel = `${prefix}-${String(token.tokenNumber).padStart(3, '0')}`;
  const etaMin = token.estimatedWaitMin ?? 0;
  const etaMax = etaMin + 10;
  const isActive = ['WAITING', 'ARRIVED', 'IN_SERVICE'].includes(token.status);
  const issuedAt = new Date(token.issuedAt);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://quzen-web.vercel.app/token/${id}`)}&color=1e3a8a&bgcolor=ffffff`;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const updatedAgo = Math.round((Date.now() - lastUpdated.getTime()) / 1000);

  return (
    <div style={{ minHeight: '100vh', background: '#eef2ff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .action-btn { transition: opacity 0.15s; cursor: pointer; }
        .action-btn:hover { opacity: 0.85; }
        .icon-btn { transition: background 0.15s; cursor: pointer; }
        .icon-btn:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ── Top Nav ── */}
      <div style={{ background: '#1e3a8a', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Quzen</div>
          <div style={{ color: '#93c5fd', fontSize: 11, marginTop: 1 }}>Wait From Anywhere</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 12px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>LIVE UPDATES</span>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ── Token Hero Card ── */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(30,58,138,0.12)', marginBottom: 16 }}>

          {/* Header strip */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '20px 20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Your Token</span>
                  {token.status === 'WAITING' || token.status === 'ARRIVED' ? (
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>Confirmed</span>
                  ) : null}
                </div>
                <div style={{ fontSize: 60, fontWeight: 900, color: '#fff', letterSpacing: -2, lineHeight: 1 }}>
                  {tokenLabel}
                </div>
                <div style={{ color: '#93c5fd', fontSize: 13, marginTop: 6 }}>
                  {token.session?.business?.sector?.replace('_', ' ')} &bull; {token.category?.name}
                </div>
              </div>
              {/* QR Code */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 6, flexShrink: 0 }}>
                <img src={qrUrl} alt="Token QR" style={{ width: 72, height: 72, display: 'block' }} />
                <div style={{ textAlign: 'center', fontSize: 9, color: '#6b7280', marginTop: 3, fontWeight: 600 }}>Token QR</div>
              </div>
            </div>

            {/* Status badge */}
            <div style={{ marginTop: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: status.bg, color: status.color, fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 100 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.dot, display: 'inline-block' }} />
                {status.label}
              </span>
            </div>

            {isActive && (
              <p style={{ color: '#bfdbfe', fontSize: 12, marginTop: 10 }}>
                Your spot is reserved. We&apos;ll notify you when it&apos;s almost your turn.
              </p>
            )}
          </div>

          {/* ETA & Queue Info */}
          {isActive && (
            <div style={{ padding: '16px 20px' }}>
              {/* ETA Row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, background: '#f0f9ff', borderRadius: 12, padding: '12px 14px', border: '1px solid #bae6fd' }}>
                  <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Estimated Wait</div>
                  <div style={{ color: '#1e3a8a', fontSize: 22, fontWeight: 800, marginTop: 2 }}>
                    {etaMin}–{etaMax} <span style={{ fontSize: 13, fontWeight: 500 }}>min</span>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#f5f3ff', borderRadius: 12, padding: '12px 14px', border: '1px solid #ddd6fe' }}>
                  <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>People Ahead</div>
                  <div style={{ color: '#7c3aed', fontSize: 22, fontWeight: 800, marginTop: 2 }}>
                    {token.aheadCount ?? 0}
                  </div>
                </div>
              </div>

              {/* Queue progress bar */}
              {token.aheadCount > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>You are <strong style={{ color: '#1e3a8a' }}>#{token.aheadCount + 1}</strong> in the queue</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{token.aheadCount} ahead of you</span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                      borderRadius: 100,
                      width: `${Math.max(5, 100 - Math.min(100, (token.aheadCount / Math.max(token.aheadCount + 1, 1)) * 100))}%`,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              )}

              {/* Relax message */}
              <div style={{ display: 'flex', gap: 12, background: '#fafafa', borderRadius: 12, padding: '12px 14px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>&#9749;</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>You can relax!</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Go for a coffee, run an errand or just chill. We&apos;ll notify you.</div>
                </div>
              </div>
            </div>
          )}

          {/* Completed state */}
          {token.status === 'COMPLETED' && (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>&#127881;</div>
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: 16 }}>Service Completed!</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Thank you for helping the next person know their wait time.</div>
            </div>
          )}

          {/* Action Buttons Row */}
          {isActive && (
            <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { icon: '&#128246;', label: 'Live Status', action: null },
                { icon: '&#128205;', label: 'Directions', action: null },
                { icon: token.status === 'WAITING' ? '&#128100;' : null, label: token.status === 'WAITING' ? 'Arrived' : null, action: token.status === 'WAITING' ? () => sendSignal('ARRIVED') : null },
                { icon: '&#10006;', label: 'Cancel', action: () => setShowCancelConfirm(true) },
              ].filter(b => b.label).map((btn, i) => (
                <button
                  key={i}
                  className="icon-btn"
                  onClick={btn.action ?? undefined}
                  style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: btn.action ? 'pointer' : 'default' }}
                >
                  <span style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: btn.icon! }} />
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500, textAlign: 'center' }}>{btn.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Signal Buttons */}
          {isActive && signalSent !== 'COMPLETED' && (
            <div style={{ padding: '0 20px 16px', display: 'flex', gap: 10 }}>
              {['WAITING', 'ARRIVED', 'IN_SERVICE'].includes(token.status) && (
                <button
                  className="action-btn"
                  onClick={() => sendSignal('COMPLETED')}
                  style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 13 }}
                >
                  &#10003; Service Done — Help Others
                </button>
              )}
            </div>
          )}

          {/* Notification strip */}
          {isActive && (
            <div style={{ background: '#1e3a8a', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>&#128276;</span>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>We will notify you when it&apos;s almost your turn</span>
              </div>
              <span style={{ color: '#93c5fd', fontSize: 16 }}>&#8250;</span>
            </div>
          )}
        </div>

        {/* ── Token Details Card ── */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(30,58,138,0.08)', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>&#128196;</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1e3a8a' }}>Token Details</span>
            </div>
          </div>
          <div style={{ padding: '4px 0' }}>
            {[
              { icon: '&#127970;', label: 'Business Name', value: token.session?.business?.name },
              { icon: '&#128205;', label: 'Branch', value: `${token.session?.business?.address}, ${token.session?.business?.city}` },
              { icon: '&#10024;', label: 'Service', value: token.category?.name },
              { icon: '&#128100;', label: 'Token Type', value: 'Walk-in' },
              { icon: '&#128197;', label: 'Date', value: formatDate(issuedAt) },
              { icon: '&#128336;', label: 'Time', value: formatTime(issuedAt) },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < 5 ? '1px solid #f8fafc' : 'none' }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: row.icon }} />
                <span style={{ fontSize: 12, color: '#9ca3af', width: 90, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Notification info */}
          <div style={{ margin: '0 16px 16px', background: '#eff6ff', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>&#11088;</span>
            <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 500 }}>You&apos;ll be notified 10 minutes before your turn.</span>
          </div>

          {/* Promo banner */}
          <div style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Save Time. Save Yourself.</div>
              <div style={{ color: '#93c5fd', fontSize: 12, marginTop: 3 }}>Join the queue from anywhere with <strong style={{ color: '#fff' }}>Quzen</strong>.</div>
            </div>
            <span style={{ fontSize: 32 }}>&#128241;</span>
          </div>
        </div>

        {/* ── Cancel Confirm Modal ── */}
        {showCancelConfirm && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #fecaca', boxShadow: '0 4px 20px rgba(220,38,38,0.12)', padding: '20px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>&#9888;&#65039;</div>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 15, marginBottom: 4 }}>Cancel this token?</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>You will lose your current position in the queue.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="action-btn"
                onClick={() => setShowCancelConfirm(false)}
                style={{ flex: 1, background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px', fontWeight: 600, fontSize: 13, color: '#374151', cursor: 'pointer' }}
              >
                Keep My Spot
              </button>
              <button
                className="action-btn"
                onClick={cancelToken}
                disabled={cancelling}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: cancelling ? 0.6 : 1 }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom Features ── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(30,58,138,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { icon: '&#128737;', title: 'Secure', desc: 'Your data is safe with us' },
              { icon: '&#128336;', title: 'Real-time Updates', desc: 'Get notified exactly when it matters' },
              { icon: '&#128276;', title: 'Smart Notifications', desc: 'Only when you need to know' },
              { icon: '&#10084;', title: 'Better Experience', desc: 'Less waiting. More living.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }} dangerouslySetInnerHTML={{ __html: f.icon }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            &#128339; Updated {updatedAgo < 10 ? 'just now' : `${updatedAgo}s ago`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Your time matters.</span>
            <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>Powered by Quzen</span>
          </div>
        </div>

      </div>
    </div>
  );
}
