'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  businessId: string;
  businessName?: string;
}

export function BusinessSubnav({ businessId, businessName }: Props) {
  const pathname = usePathname();

  const tabs = [
    { href: `/dashboard/${businessId}/queue`,      icon: '📋', label: 'Live Queue' },
    { href: `/dashboard/${businessId}/categories`, icon: '🗂️', label: 'Categories' },
    { href: `/dashboard/${businessId}/analytics`,  icon: '📊', label: 'Analytics' },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        {/* Business name breadcrumb */}
        <div className="flex items-center gap-2 pt-3 pb-1 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600 transition">My Businesses</Link>
          <span>›</span>
          <span className="text-gray-800 font-medium truncate">{businessName ?? 'Business'}</span>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                  active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
