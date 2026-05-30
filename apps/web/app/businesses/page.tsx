'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { SECTOR_META } from '@/lib/sector-categories';
import api from '@/lib/api';

const SECTOR_LABELS: Record<string, string> = {
  DIAGNOSTIC: 'Diagnostic Centers',
  HOSPITAL: 'Hospitals & Clinics',
  BANK: 'Banks',
  RESTAURANT: 'Restaurants',
  SALON: 'Salons & Parlours',
  VEHICLE_SERVICE: 'Vehicle Service',
};

function BusinessesList() {
  const searchParams = useSearchParams();
  const sector = searchParams.get('sector') ?? '';
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sector) params.set('sector', sector);
    api.get(`/businesses?${params}`).then((r) => {
      setBusinesses(r.data);
      setLoading(false);
    });
  }, [sector]);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        {sector ? SECTOR_LABELS[sector] : 'All Businesses'}
      </h1>
      <p className="text-gray-500 text-sm mb-8">Select a business to join its queue</p>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {!loading && businesses.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏢</p>
          <p>No businesses found in this sector yet.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {businesses.map((b) => (
          <Link
            key={b.id}
            href={`/businesses/${b.id}`}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition flex flex-col"
          >
            <div className="relative">
              {b.imageUrl ? (
                <img src={b.imageUrl} alt={b.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-indigo-50 flex items-center justify-center text-5xl">🏢</div>
              )}
              <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-lg px-2 py-1 rounded-lg shadow-sm">
                {SECTOR_META[b.sector]?.icon ?? '🏢'}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">{b.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{b.address}, {b.city}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {b.categories.slice(0, 3).map((c: any) => (
                    <span key={c.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {c.name}
                    </span>
                  ))}
                  {b.categories.length > 3 && (
                    <span className="text-xs text-gray-400">+{b.categories.length - 3} more</span>
                  )}
                </div>
              </div>
              <span className="text-indigo-600 text-sm font-medium mt-3">Join Queue →</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function BusinessesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 py-10">
        <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
          <BusinessesList />
        </Suspense>
      </div>
    </div>
  );
}
