'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  const isActive = (href: string) =>
    pathname === href
      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5'
      : 'text-gray-600 hover:text-indigo-600 transition';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-indigo-600 tracking-tight flex-shrink-0">
          Quzen
        </Link>

        {/* Nav links — center */}
        {user && (
          <div className="flex items-center gap-6 text-sm">
            {user.role === 'BUSINESS_OWNER' ? (
              <>
                <Link href="/dashboard" className={isActive('/dashboard')}>My Businesses</Link>
                <Link href="/dashboard/new" className={isActive('/dashboard/new')}>+ New Business</Link>
              </>
            ) : (
              <>
                <Link href="/businesses" className={isActive('/businesses')}>Find a Queue</Link>
                <Link href="/my-tokens" className={isActive('/my-tokens')}>My Tokens</Link>
                <Link href="/account" className={isActive('/account')}>My Account</Link>
              </>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar button */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:border-indigo-300 transition"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 text-xs font-medium">{user.name.split(' ')[0]}</span>
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === 'BUSINESS_OWNER'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {user.role === 'BUSINESS_OWNER' ? 'Business Owner' : 'Member'}
                    </span>
                  </div>

                  {/* Role-based menu items */}
                  <div className="py-1">
                    {user.role === 'BUSINESS_OWNER' ? (
                      <>
                        <MenuItem href="/dashboard" icon="🏢" label="My Businesses" onClick={() => setMenuOpen(false)} />
                        <MenuItem href="/dashboard/new" icon="➕" label="Register New Business" onClick={() => setMenuOpen(false)} />
                      </>
                    ) : (
                      <>
                        <MenuItem href="/businesses" icon="🔍" label="Find a Queue" onClick={() => setMenuOpen(false)} />
                        <MenuItem href="/my-tokens" icon="🎫" label="My Tokens" onClick={() => setMenuOpen(false)} />
                        <MenuItem href="/account" icon="👤" label="My Account" onClick={() => setMenuOpen(false)} />
                      </>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-50 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left"
                    >
                      <span>🚪</span>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 text-sm">Login</Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function MenuItem({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
