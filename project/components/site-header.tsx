'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/components/demo-provider';
import { useState } from 'react';

export function SiteHeader() {
  const { user, ready, logout, notice } = useDemo();
  const router = useRouter();
  const [error, setError] = useState('');
  return <>
    <header className="border-b border-green-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-gray-900"><Sprout className="h-8 w-8 text-green-600" />EthioAgri</Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/products/" className="hover:text-green-700">Products</Link>
          <Link href="/farmers/" className="hover:text-green-700">Farmers</Link>
          {ready && user ? <>
            {user.role === 'farmer' && <Link href="/dashboard/" className="font-semibold text-green-700">My Farm</Link>}
            <span className="text-gray-600">{user.name} <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">{user.role}</span></span>
            <Button variant="outline" size="sm" onClick={() => { try { logout(); router.push('/'); } catch (e) { setError((e as Error).message); } }}>Sign out</Button>
          </> : <Link href="/login/" className="font-semibold text-green-700">Sign in</Link>}
        </nav>
      </div>
    </header>
    <div className="bg-amber-50 border-b border-amber-100 text-amber-900 text-center text-xs px-4 py-2">Demo marketplace · Sample accounts and orders · Activity is saved only in this browser · No payments or messages are sent</div>
    {(notice || error) && <p role="alert" className="bg-red-50 text-red-800 p-3 text-center">{error || notice}</p>}
  </>;
}
